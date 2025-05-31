import { NextApiRequest, NextApiResponse } from 'next';
import { analyticsService } from '../../../../src/services/analytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contentId } = req.query;

  try {
    const analytics = await analyticsService.getContentAnalytics(contentId as string);
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 