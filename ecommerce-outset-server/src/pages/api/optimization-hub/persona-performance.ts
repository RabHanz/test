import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import { PersonaType } from '../../../types/optimizationHub';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { personaType } = req.query;

        if (personaType) {
          // Get specific persona performance
          const performance = await prisma.personaPerformance.findFirst({
            where: {
              personaType: personaType as PersonaType,
            },
            include: {
              metrics: true,
              recommendations: true,
            },
          });

          if (!performance) {
            return res.status(404).json({ error: 'Persona performance not found' });
          }

          return res.status(200).json(performance);
        }

        // Get all persona performances
        const performances = await prisma.personaPerformance.findMany({
          include: {
            metrics: true,
            recommendations: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });

        return res.status(200).json(performances);
      } catch (error) {
        console.error('Error fetching persona performance:', error);
        return res.status(500).json({ error: 'Failed to fetch persona performance' });
      }

    case 'POST':
      try {
        const { personaType, metrics, recommendations } = req.body;

        const performance = await prisma.personaPerformance.create({
          data: {
            personaType,
            metrics: {
              create: metrics,
            },
            recommendations: {
              create: recommendations,
            },
          },
          include: {
            metrics: true,
            recommendations: true,
          },
        });

        return res.status(201).json(performance);
      } catch (error) {
        console.error('Error creating persona performance:', error);
        return res.status(500).json({ error: 'Failed to create persona performance' });
      }

    case 'PUT':
      try {
        const { id, metrics, recommendations } = req.body;

        const performance = await prisma.personaPerformance.update({
          where: {
            id,
          },
          data: {
            metrics: {
              update: metrics,
            },
            recommendations: {
              update: recommendations,
            },
          },
          include: {
            metrics: true,
            recommendations: true,
          },
        });

        return res.status(200).json(performance);
      } catch (error) {
        console.error('Error updating persona performance:', error);
        return res.status(500).json({ error: 'Failed to update persona performance' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 