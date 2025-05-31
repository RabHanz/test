import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/api';
import { AnalyticsService } from '../../../services/analytics';

const analyticsService = new AnalyticsService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const alerts = await analyticsService.checkAlertThresholds();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, metric, value, operator, notificationChannels } = req.body;

    if (!name || !metric || !value || !operator) {
      return res.status(400).json({
        message: 'Missing required parameters: name, metric, value, operator',
      });
    }

    const threshold = await prisma.alertThreshold.create({
      data: {
        name,
        metric,
        value,
        operator,
        notificationChannels,
      },
    });

    res.status(201).json(threshold);
  } catch (error) {
    console.error('Error creating alert threshold:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { name, metric, value, operator, notificationChannels } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing required parameter: id' });
    }

    const threshold = await prisma.alertThreshold.update({
      where: { id: id as string },
      data: {
        name,
        metric,
        value,
        operator,
        notificationChannels,
      },
    });

    res.status(200).json(threshold);
  } catch (error) {
    console.error('Error updating alert threshold:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Missing required parameter: id' });
    }

    await prisma.alertThreshold.delete({
      where: { id: id as string },
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting alert threshold:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 