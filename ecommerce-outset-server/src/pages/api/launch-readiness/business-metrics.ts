import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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
      const businessMetrics = await prisma.businessMetrics.findMany({
        include: {
          goals: true,
          kpis: true
        }
      });
      return res.status(200).json(businessMetrics);
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      return res.status(500).json({ error: 'Failed to fetch business metrics' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { personaType, metrics } = req.body;

      const updatedMetrics = await prisma.businessMetrics.update({
        where: { personaType },
        data: {
          ...metrics,
          updatedAt: new Date(),
          updatedBy: session.user.id
        },
        include: {
          goals: true,
          kpis: true
        }
      });

      // Check if any goals have been achieved
      const achievedGoals = updatedMetrics.goals.filter(goal => {
        const currentValue = updatedMetrics.kpis.find(kpi => kpi.name === goal.kpiName)?.value || 0;
        return currentValue >= goal.target;
      });

      // Create notifications for achieved goals
      for (const goal of achievedGoals) {
        await prisma.launchNotification.create({
          data: {
            type: 'GOAL_ACHIEVED',
            title: 'Business Goal Achieved',
            message: `Goal "${goal.name}" for ${personaType} has been achieved!`,
            severity: 'SUCCESS',
            read: false
          }
        });
      }

      return res.status(200).json(updatedMetrics);
    } catch (error) {
      console.error('Error updating business metrics:', error);
      return res.status(500).json({ error: 'Failed to update business metrics' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { personaType, name, description, goals, kpis } = req.body;

      const newMetrics = await prisma.businessMetrics.create({
        data: {
          personaType,
          name,
          description,
          goals: {
            create: goals
          },
          kpis: {
            create: kpis
          },
          createdBy: session.user.id
        },
        include: {
          goals: true,
          kpis: true
        }
      });

      return res.status(201).json(newMetrics);
    } catch (error) {
      console.error('Error creating business metrics:', error);
      return res.status(500).json({ error: 'Failed to create business metrics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 