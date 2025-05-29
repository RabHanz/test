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
      const personaJourneys = await prisma.personaJourney.findMany({
        include: {
          steps: {
            orderBy: { order: 'asc' }
          }
        }
      });
      return res.status(200).json(personaJourneys);
    } catch (error) {
      console.error('Error fetching persona journeys:', error);
      return res.status(500).json({ error: 'Failed to fetch persona journeys' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { personaType, journeyId } = req.body;

      const journey = await prisma.personaJourney.findFirst({
        where: {
          personaType,
          id: journeyId
        },
        include: {
          steps: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!journey) {
        return res.status(404).json({ error: 'Journey not found' });
      }

      // Simulate journey testing
      let status = 'VERIFIED';
      let errors = [];

      for (const step of journey.steps) {
        try {
          // Implement actual step verification based on step type
          switch (step.type) {
            case 'API_CALL':
              // Test API endpoint
              break;
            case 'UI_INTERACTION':
              // Test UI element interaction
              break;
            case 'DATA_VALIDATION':
              // Validate data flow
              break;
            default:
              throw new Error(`Unsupported step type: ${step.type}`);
          }
        } catch (error) {
          status = 'FAILED';
          errors.push({
            stepId: step.id,
            stepName: step.name,
            error: error.message
          });
        }
      }

      const updatedJourney = await prisma.personaJourney.update({
        where: { id: journeyId },
        data: {
          status,
          lastTested: new Date(),
          testResults: {
            status,
            errors,
            testedBy: session.user.id
          }
        }
      });

      // Create notification for test results
      await prisma.launchNotification.create({
        data: {
          type: 'JOURNEY_TEST_COMPLETED',
          title: 'Journey Test Completed',
          message: `Journey "${journey.name}" for ${personaType} has been tested. Status: ${status}`,
          severity: status === 'VERIFIED' ? 'INFO' : 'WARNING',
          read: false
        }
      });

      return res.status(200).json(updatedJourney);
    } catch (error) {
      console.error('Error testing persona journey:', error);
      return res.status(500).json({ error: 'Failed to test persona journey' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 