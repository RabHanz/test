import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/api';
import { AnalyticsService } from '../../../services/analytics';

const analyticsService = new AnalyticsService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const recommendations = await analyticsService.generateOptimizationRecommendations();
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 