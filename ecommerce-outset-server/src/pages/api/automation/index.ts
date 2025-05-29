import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AutomationPlatform, AutomationStatus, AutomationType } from '../../../types/automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const workflows = await prisma.automationWorkflow.findMany({
        include: {
          actions: true,
          metadata: true,
          metrics: true,
        },
      });

      const templates = await prisma.automationTemplate.findMany();
      const alerts = await prisma.automationAlert.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      const metrics = await calculateMetrics();

      res.status(200).json({
        workflows,
        templates,
        alerts,
        metrics,
      });
    } catch (error) {
      console.error('Error fetching automation data:', error);
      res.status(500).json({ error: 'Failed to fetch automation data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function calculateMetrics() {
  const [
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    successfulExecutions,
    platformMetrics,
    personaMetrics,
  ] = await Promise.all([
    prisma.automationWorkflow.count(),
    prisma.automationWorkflow.count({
      where: { status: AutomationStatus.ACTIVE },
    }),
    prisma.automationLog.count(),
    prisma.automationLog.count({
      where: { status: AutomationStatus.COMPLETED },
    }),
    calculatePlatformMetrics(),
    calculatePersonaMetrics(),
  ]);

  const averageSuccessRate = totalExecutions > 0
    ? (successfulExecutions / totalExecutions) * 100
    : 0;

  return {
    overallMetrics: {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      averageSuccessRate,
      totalCost: await calculateTotalCost(),
      timeSaved: await calculateTimeSaved(),
    },
    platformMetrics,
    personaMetrics,
  };
}

async function calculatePlatformMetrics() {
  const platforms = Object.values(AutomationPlatform);
  const metrics: Record<AutomationPlatform, any> = {} as Record<AutomationPlatform, any>;

  for (const platform of platforms) {
    const [
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      errorCount,
    ] = await Promise.all([
      prisma.automationWorkflow.count({
        where: {
          platform,
          status: AutomationStatus.ACTIVE,
        },
      }),
      prisma.automationLog.count({
        where: { platform },
      }),
      prisma.automationLog.count({
        where: {
          platform,
          status: AutomationStatus.COMPLETED,
        },
      }),
      prisma.automationLog.count({
        where: {
          platform,
          status: AutomationStatus.ERROR,
        },
      }),
    ]);

    const successRate = totalExecutions > 0
      ? (successfulExecutions / totalExecutions) * 100
      : 0;

    const errorRate = totalExecutions > 0
      ? (errorCount / totalExecutions) * 100
      : 0;

    metrics[platform] = {
      activeWorkflows,
      successRate,
      averageProcessingTime: await calculateAverageProcessingTime(platform),
      errorRate,
      cost: await calculatePlatformCost(platform),
    };
  }

  return metrics;
}

async function calculatePersonaMetrics() {
  const personas = ['StartupSam', 'ScalingSarah', 'LearningLarry', 'InvestorIan', 'ProviderPriya'];
  const metrics: Record<string, any> = {};

  for (const persona of personas) {
    const [
      activeWorkflows,
      totalConversions,
      totalTimeToConversion,
      totalRevenue,
    ] = await Promise.all([
      prisma.automationWorkflow.count({
        where: {
          metadata: {
            path: ['personaType'],
            equals: persona,
          },
          status: AutomationStatus.ACTIVE,
        },
      }),
      prisma.automationLog.count({
        where: {
          event: 'CONVERSION',
          details: {
            path: ['personaType'],
            equals: persona,
          },
        },
      }),
      prisma.automationLog.aggregate({
        where: {
          event: 'CONVERSION',
          details: {
            path: ['personaType'],
            equals: persona,
          },
        },
        _sum: {
          duration: true,
        },
      }),
      prisma.automationLog.aggregate({
        where: {
          event: 'REVENUE',
          details: {
            path: ['personaType'],
            equals: persona,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    metrics[persona] = {
      activeWorkflows,
      conversionRate: await calculateConversionRate(persona),
      averageTimeToConversion: totalTimeToConversion._sum.duration || 0,
      revenueAttribution: totalRevenue._sum.amount || 0,
    };
  }

  return metrics;
}

async function calculateAverageProcessingTime(platform: AutomationPlatform) {
  const result = await prisma.automationLog.aggregate({
    where: {
      platform,
      status: AutomationStatus.COMPLETED,
    },
    _avg: {
      duration: true,
    },
  });

  return result._avg.duration || 0;
}

async function calculatePlatformCost(platform: AutomationPlatform) {
  // Implement platform-specific cost calculation
  return 0;
}

async function calculateTotalCost() {
  // Implement total cost calculation
  return 0;
}

async function calculateTimeSaved() {
  // Implement time saved calculation
  return 0;
}

async function calculateConversionRate(persona: string) {
  const totalLeads = await prisma.automationLog.count({
    where: {
      event: 'LEAD_CREATED',
      details: {
        path: ['personaType'],
        equals: persona,
      },
    },
  });

  const conversions = await prisma.automationLog.count({
    where: {
      event: 'CONVERSION',
      details: {
        path: ['personaType'],
        equals: persona,
      },
    },
  });

  return totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;
} 