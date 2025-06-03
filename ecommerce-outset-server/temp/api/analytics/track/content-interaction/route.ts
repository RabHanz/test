import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, interactionType, metadata } = body;

    if (!contentId || !interactionType) {
      return NextResponse.json(
        { error: 'Content ID and interaction type are required' },
        { status: 400 }
      );
    }

    await analyticsService.trackContentInteraction(contentId, interactionType, metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Content interaction tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track content interaction' },
      { status: 500 }
    );
  }
} 