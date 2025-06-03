import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    // Create event record in database
    const event = await prisma.userEvent.create({
      data: {
        type,
        userId: data.userId,
        metadata: data.metadata || {},
      },
    });

    // Track event in analytics service
    await analyticsService.trackUserEvent({
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      path: data.path || '/',
      metadata: (event.metadata || {}) as Record<string, any>
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 