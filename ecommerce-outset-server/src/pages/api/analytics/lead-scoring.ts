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
    const metrics = await analyticsService.getLeadScoringMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching lead scoring metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 