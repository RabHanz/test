import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import { OptimizationTask } from '../../../types/optimizationHub';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await prisma.optimizationTask.findMany({
          include: {
            assignedTo: true,
            createdBy: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json(tasks);
      } catch (error) {
        console.error('Error fetching optimization tasks:', error);
        return res.status(500).json({ error: 'Failed to fetch optimization tasks' });
      }

    case 'POST':
      try {
        const taskData = req.body as Partial<OptimizationTask>;
        
        const task = await prisma.optimizationTask.create({
          data: {
            ...taskData,
            createdBy: {
              connect: {
                id: session.user.id,
              },
            },
            assignedTo: taskData.assignedToId ? {
              connect: {
                id: taskData.assignedToId,
              },
            } : undefined,
          },
          include: {
            assignedTo: true,
            createdBy: true,
          },
        });

        return res.status(201).json(task);
      } catch (error) {
        console.error('Error creating optimization task:', error);
        return res.status(500).json({ error: 'Failed to create optimization task' });
      }

    case 'PUT':
      try {
        const { id, ...updates } = req.body as Partial<OptimizationTask> & { id: string };
        
        const task = await prisma.optimizationTask.update({
          where: {
            id,
          },
          data: {
            ...updates,
            assignedTo: updates.assignedToId ? {
              connect: {
                id: updates.assignedToId,
              },
            } : undefined,
          },
          include: {
            assignedTo: true,
            createdBy: true,
          },
        });

        return res.status(200).json(task);
      } catch (error) {
        console.error('Error updating optimization task:', error);
        return res.status(500).json({ error: 'Failed to update optimization task' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 