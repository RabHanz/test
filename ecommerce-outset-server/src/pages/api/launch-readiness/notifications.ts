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
      const { page = 1, limit = 10, unreadOnly = false } = req.query;

      const where = unreadOnly === 'true' ? { read: false } : {};

      const [notifications, total] = await Promise.all([
        prisma.launchNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.launchNotification.count({ where })
      ]);

      return res.status(200).json({
        notifications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { notificationId } = req.body;

      const updatedNotification = await prisma.launchNotification.update({
        where: { id: notificationId },
        data: {
          read: true,
          readAt: new Date(),
          readBy: session.user.id
        }
      });

      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { notificationId } = req.body;

      await prisma.launchNotification.delete({
        where: { id: notificationId }
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting notification:', error);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 