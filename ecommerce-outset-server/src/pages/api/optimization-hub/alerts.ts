import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import { AnomalyAlert } from '../../../types/optimizationHub';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { resolved } = req.query;
        
        const alerts = await prisma.anomalyAlert.findMany({
          where: resolved ? {
            resolved: resolved === 'true',
          } : undefined,
          include: {
            createdBy: true,
            resolvedBy: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json(alerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return res.status(500).json({ error: 'Failed to fetch alerts' });
      }

    case 'POST':
      try {
        const alertData = req.body as Partial<AnomalyAlert>;
        
        const alert = await prisma.anomalyAlert.create({
          data: {
            ...alertData,
            createdBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
          include: {
            createdBy: true,
          },
        });

        return res.status(201).json(alert);
      } catch (error) {
        console.error('Error creating alert:', error);
        return res.status(500).json({ error: 'Failed to create alert' });
      }

    case 'PUT':
      try {
        const { id, resolved, resolution } = req.body;

        const alert = await prisma.anomalyAlert.update({
          where: {
            id,
          },
          data: {
            resolved,
            resolution,
            resolvedBy: resolved ? {
              connect: {
                id: session.user.id,
              },
            } : undefined,
            resolvedAt: resolved ? new Date() : undefined,
          },
          include: {
            createdBy: true,
            resolvedBy: true,
          },
        });

        return res.status(200).json(alert);
      } catch (error) {
        console.error('Error updating alert:', error);
        return res.status(500).json({ error: 'Failed to update alert' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 