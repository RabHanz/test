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
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required parameters: startDate, endDate',
      });
    }

    const dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string),
    };

    const metrics = await analyticsService.getRevenueMetrics(dateRange);
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 