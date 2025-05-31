import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch all launch readiness data
      const [
        integrations,
        checklist,
        personaJourneys,
        businessMetrics,
        notifications,
        rollbackPlan,
        successMetrics
      ] = await Promise.all([
        prisma.integrationHealth.findMany(),
        prisma.checklistItem.findMany(),
        prisma.personaJourney.findMany(),
        prisma.businessMetrics.findMany(),
        prisma.launchNotification.findMany({
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.rollbackPlan.findFirst({
          include: { steps: true }
        }),
        prisma.launchSuccessMetrics.findFirst({
          include: { goals: true }
        })
      ]);

      // Calculate overall readiness score
      const checklistScore = checklist.reduce((acc, item) => {
        return acc + (item.status === 'COMPLETED' ? 1 : 0);
      }, 0) / checklist.length * 100;

      const integrationScore = integrations.reduce((acc, integration) => {
        return acc + (integration.status === 'HEALTHY' ? 1 : 0);
      }, 0) / integrations.length * 100;

      const journeyScore = personaJourneys.reduce((acc, journey) => {
        return acc + (journey.status === 'VERIFIED' ? 1 : 0);
      }, 0) / personaJourneys.length * 100;

      const overallScore = (checklistScore + integrationScore + journeyScore) / 3;

      return res.status(200).json({
        overallScore,
        checklistScore,
        integrationScore,
        journeyScore,
        integrations,
        checklist,
        personaJourneys,
        businessMetrics,
        notifications,
        rollbackPlan,
        successMetrics
      });
    } catch (error) {
      console.error('Error fetching launch readiness data:', error);
      return res.status(500).json({ error: 'Failed to fetch launch readiness data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 