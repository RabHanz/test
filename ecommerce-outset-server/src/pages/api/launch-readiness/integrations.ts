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
      const integrations = await prisma.integrationHealth.findMany();
      return res.status(200).json(integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return res.status(500).json({ error: 'Failed to fetch integrations' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { integrationId } = req.body;
      
      // Simulate integration health check
      const integration = await prisma.integrationHealth.findUnique({
        where: { id: integrationId }
      });

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      // Perform actual health check based on integration type
      let status = 'HEALTHY';
      let lastChecked = new Date();
      let error = null;

      try {
        switch (integration.type) {
          case 'ZAPIER':
            // Implement Zapier webhook health check
            break;
          case 'MAKE':
            // Implement Make.com scenario health check
            break;
          case 'SHOPIFY':
            // Implement Shopify API health check
            break;
          case 'AMAZON':
            // Implement Amazon Seller API health check
            break;
          default:
            throw new Error(`Unsupported integration type: ${integration.type}`);
        }
      } catch (checkError) {
        status = 'UNHEALTHY';
        error = checkError.message;
      }

      const updatedIntegration = await prisma.integrationHealth.update({
        where: { id: integrationId },
        data: {
          status,
          lastChecked,
          error
        }
      });

      return res.status(200).json(updatedIntegration);
    } catch (error) {
      console.error('Error checking integration health:', error);
      return res.status(500).json({ error: 'Failed to check integration health' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 