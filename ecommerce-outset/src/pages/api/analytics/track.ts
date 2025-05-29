import { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const event = req.body;
    const timestamp = new Date().toISOString();
    const eventKey = `analytics:${event.event_type}:${timestamp}`;

    // Store event in Redis
    await redis.set(eventKey, JSON.stringify(event), {
      ex: 60 * 60 * 24 * 30, // 30 days expiration
    });

    // Update aggregate metrics
    await updateAggregateMetrics(event);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function updateAggregateMetrics(event: any) {
  const date = new Date().toISOString().split('T')[0];
  const metricsKey = `analytics:metrics:${date}`;

  // Get current metrics
  const currentMetrics = await redis.get(metricsKey);
  const metrics = currentMetrics ? JSON.parse(currentMetrics) : {
    totalLeads: 0,
    calculatorUsage: {},
    blogMetrics: {
      totalReads: 0,
      averageReadTime: 0,
      categoryEngagement: {},
      interactionRates: {
        comments: 0,
        shares: 0,
        saves: 0,
        relatedArticles: 0,
      },
    },
    averageScores: {},
    leadQualifications: {
      Hot: 0,
      Warm: 0,
      Cold: 0,
    },
  };

  // Update metrics
  metrics.totalLeads++;

  if (event.calculatorType === 'Blog') {
    // Update blog-specific metrics
    metrics.blogMetrics.totalReads++;
    metrics.blogMetrics.averageReadTime = 
      (metrics.blogMetrics.averageReadTime * (metrics.blogMetrics.totalReads - 1) + (event.readTime || 0)) / 
      metrics.blogMetrics.totalReads;

    // Update category engagement
    if (event.category) {
      metrics.blogMetrics.categoryEngagement[event.category] = 
        (metrics.blogMetrics.categoryEngagement[event.category] || 0) + 1;
    }

    // Update interaction rates
    if (event.interactions) {
      if (event.interactions.comments) {
        metrics.blogMetrics.interactionRates.comments++;
      }
      if (event.interactions.shares) {
        metrics.blogMetrics.interactionRates.shares++;
      }
      if (event.interactions.saves) {
        metrics.blogMetrics.interactionRates.saves++;
      }
      metrics.blogMetrics.interactionRates.relatedArticles += event.interactions.relatedArticles || 0;
    }
  } else {
    // Update calculator metrics
    metrics.calculatorUsage[event.calculatorType] = 
      (metrics.calculatorUsage[event.calculatorType] || 0) + 1;
  }
  
  if (event.leadScore) {
    const { totalScore, qualification } = event.leadScore;
    metrics.averageScores[event.calculatorType] = 
      ((metrics.averageScores[event.calculatorType] || 0) + totalScore) / 2;
    metrics.leadQualifications[qualification]++;
  }

  // Store updated metrics
  await redis.set(metricsKey, JSON.stringify(metrics), {
    ex: 60 * 60 * 24 * 30, // 30 days expiration
  });
} 