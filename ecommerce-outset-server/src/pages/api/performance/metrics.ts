import { NextApiRequest, NextApiResponse } from 'next';
import { performanceService } from '../../../services/performanceService';
import { isFeatureEnabled } from '../../../shared/config/features';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
    return res.status(403).json({ error: 'Performance monitoring is disabled' });
  }

  if (req.method === 'GET') {
    const { name } = req.query;

    if (name && typeof name === 'string') {
      const metrics = performanceService.getMetrics(name);
      return res.status(200).json({ metrics });
    }

    const summary = performanceService.getMetricsSummary();
    return res.status(200).json({ summary });
  }

  if (req.method === 'POST') {
    const { name, value, unit } = req.body;

    if (!name || typeof value !== 'number') {
      return res.status(400).json({ error: 'Invalid metric data' });
    }

    performanceService.trackMetric(name, value, unit);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { name } = req.query;

    if (name && typeof name === 'string') {
      performanceService.clearMetrics(name);
    } else {
      performanceService.clearMetrics();
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 