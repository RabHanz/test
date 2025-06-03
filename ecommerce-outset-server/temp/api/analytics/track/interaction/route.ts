import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interactionType, path, metadata } = body;

    if (!interactionType || !path) {
      return NextResponse.json(
        { error: 'Interaction type and path are required' },
        { status: 400 }
      );
    }

    await analyticsService.trackInteraction(interactionType, path, metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
} 