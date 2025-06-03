import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimiter } from '../../../middleware/rateLimiter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  await new Promise((resolve) => rateLimiter.middleware()(req, res, resolve));

  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid events format' });
    }

    // Process events (in a real implementation, you would store these in a database)
    console.log('Received monitoring events:', events);

    // You could also send these events to a monitoring service like Datadog, New Relic, etc.
    // await monitoringService.sendEvents(events);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing monitoring events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 