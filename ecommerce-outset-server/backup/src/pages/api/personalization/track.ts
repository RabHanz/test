import { NextApiRequest, NextApiResponse } from 'next';
import { PersonalizationService } from '../../../services/personalization';
import { UserContext, InteractionType } from '../../../types/personalization';

const personalizationService = new PersonalizationService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { context, interactionType, metadata } = req.body;
    await personalizationService.trackInteraction(
      context as UserContext,
      interactionType as InteractionType,
      metadata
    );
    res.status(200).json({ message: 'Interaction tracked successfully' });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 