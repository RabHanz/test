import { NextApiRequest, NextApiResponse } from 'next';
import { analyticsService } from '../../../src/services/analytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contentId, interactionType, metadata } = req.body;

  try {
    await analyticsService.trackContentInteraction(contentId, interactionType, metadata);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking content interaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 