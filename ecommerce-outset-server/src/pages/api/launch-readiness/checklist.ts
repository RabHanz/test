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
      const checklist = await prisma.checklistItem.findMany({
        orderBy: { order: 'asc' }
      });
      return res.status(200).json(checklist);
    } catch (error) {
      console.error('Error fetching checklist:', error);
      return res.status(500).json({ error: 'Failed to fetch checklist' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { itemId, status, notes } = req.body;

      const updatedItem = await prisma.checklistItem.update({
        where: { id: itemId },
        data: {
          status,
          notes,
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      });

      // Create notification if item is marked as completed
      if (status === 'COMPLETED') {
        await prisma.launchNotification.create({
          data: {
            type: 'CHECKLIST_ITEM_COMPLETED',
            title: 'Checklist Item Completed',
            message: `Checklist item "${updatedItem.title}" has been marked as completed.`,
            severity: 'INFO',
            read: false
          }
        });
      }

      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return res.status(500).json({ error: 'Failed to update checklist item' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, category, order } = req.body;

      const newItem = await prisma.checklistItem.create({
        data: {
          title,
          description,
          category,
          order,
          status: 'PENDING',
          createdBy: session.user.id
        }
      });

      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating checklist item:', error);
      return res.status(500).json({ error: 'Failed to create checklist item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 