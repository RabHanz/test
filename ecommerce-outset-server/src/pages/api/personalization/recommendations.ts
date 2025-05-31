import { NextApiRequest, NextApiResponse } from 'next';
import { PersonalizationService } from '../../../services/personalization';
import { UserContext } from '../../../types/personalization';

const personalizationService = new PersonalizationService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const context: UserContext = req.body;
    const recommendations = await personalizationService.getRecommendations(context);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 