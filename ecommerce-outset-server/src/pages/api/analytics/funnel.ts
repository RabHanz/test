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
    const { personaId, startDate, endDate } = req.query;

    if (!personaId || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing required parameters: personaId, startDate, endDate',
      });
    }

    const dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string),
    };

    const metrics = await analyticsService.getFunnelMetrics(
      personaId as string,
      dateRange
    );

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching funnel metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 