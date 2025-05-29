import { NextApiRequest, NextApiResponse } from 'next';
import { hubspotService } from '../../../services/hubspot';
import { leadScoringService } from '../../../services/leadScoring';
import { resourceLeadScoringService } from '../../../services/resourceLeadScoring';
import { analyticsService } from '../../../services/analytics';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      email, 
      name, 
      calculatorType, 
      score, 
      personaType,
      resourceInteractions,
      category,
      articleId,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    // Calculate lead scores
    const calculatorScore = calculatorType 
      ? leadScoringService.calculateLeadScore([
          { score, calculatorType, personaType },
        ])
      : null;

    const resourceScore = resourceInteractions
      ? resourceLeadScoringService.calculateLeadScore(resourceInteractions)
      : null;

    // Combine scores if both exist
    const finalScore = calculatorScore && resourceScore
      ? {
          totalScore: Math.round((calculatorScore.totalScore + resourceScore.totalScore) / 2),
          qualification: calculatorScore.totalScore > resourceScore.totalScore 
            ? calculatorScore.qualification 
            : resourceScore.qualification,
          recommendations: [
            ...calculatorScore.recommendations,
            ...resourceScore.recommendations,
          ],
        }
      : calculatorScore || resourceScore;

    // Capture lead in HubSpot
    const result = await hubspotService.captureLead({
      email,
      name,
      calculatorType,
      score: finalScore?.totalScore,
      personaType,
      leadScore: finalScore?.totalScore,
      leadQualification: finalScore?.qualification,
      category,
      articleId,
      interests: resourceScore?.interests,
      recommendations: finalScore?.recommendations,
    });

    if (result.success) {
      // Track analytics
      await analyticsService.trackLeadCapture({
        email,
        calculatorType,
        score: finalScore?.totalScore || 0,
        personaType,
        leadScore: finalScore ? {
          totalScore: finalScore.totalScore,
          qualification: finalScore.qualification,
        } : undefined,
      });

      return res.status(200).json({
        ...result,
        leadScore: finalScore,
      });
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in lead capture API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 