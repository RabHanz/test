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
      const rollbackPlan = await prisma.rollbackPlan.findFirst({
        include: {
          steps: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!rollbackPlan) {
        return res.status(404).json({ error: 'Rollback plan not found' });
      }

      return res.status(200).json(rollbackPlan);
    } catch (error) {
      console.error('Error fetching rollback plan:', error);
      return res.status(500).json({ error: 'Failed to fetch rollback plan' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, steps } = req.body;

      const rollbackPlan = await prisma.rollbackPlan.create({
        data: {
          name,
          description,
          steps: {
            create: steps.map((step: any, index: number) => ({
              ...step,
              order: index + 1
            }))
          },
          createdBy: session.user.id
        },
        include: {
          steps: true
        }
      });

      return res.status(201).json(rollbackPlan);
    } catch (error) {
      console.error('Error creating rollback plan:', error);
      return res.status(500).json({ error: 'Failed to create rollback plan' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { stepId, verified } = req.body;

      const updatedStep = await prisma.rollbackStep.update({
        where: { id: stepId },
        data: {
          verified,
          verifiedAt: verified ? new Date() : null,
          verifiedBy: verified ? session.user.id : null
        }
      });

      // Check if all steps are verified
      const allSteps = await prisma.rollbackStep.findMany({
        where: { rollbackPlanId: updatedStep.rollbackPlanId }
      });

      const allVerified = allSteps.every(step => step.verified);

      if (allVerified) {
        await prisma.launchNotification.create({
          data: {
            type: 'ROLLBACK_PLAN_VERIFIED',
            title: 'Rollback Plan Verified',
            message: 'All rollback steps have been verified and the plan is ready.',
            severity: 'SUCCESS',
            read: false
          }
        });
      }

      return res.status(200).json(updatedStep);
    } catch (error) {
      console.error('Error updating rollback step:', error);
      return res.status(500).json({ error: 'Failed to update rollback step' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 