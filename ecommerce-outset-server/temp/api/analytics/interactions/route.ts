import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';
import { prisma } from '@/lib/prisma';

interface UserInteraction {
  id: string;
  type: string;
  timestamp: Date;
  userId: string | null;
  contentId: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const contentId = searchParams.get('contentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query conditions
    const conditions = [];
    const params = [];
    if (type) {
      conditions.push('"type" = $1');
      params.push(type);
    }
    if (userId) {
      conditions.push('"userId" = $' + (params.length + 1));
      params.push(userId);
    }
    if (contentId) {
      conditions.push('"contentId" = $' + (params.length + 1));
      params.push(contentId);
    }
    if (startDate) {
      conditions.push('"timestamp" >= $' + (params.length + 1));
      params.push(new Date(startDate));
    }
    if (endDate) {
      conditions.push('"timestamp" <= $' + (params.length + 1));
      params.push(new Date(endDate));
    }

    // Get user interactions from database
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM "UserInteraction"
      ${whereClause}
      ORDER BY "timestamp" DESC
    `;
    const interactions = await prisma.$queryRawUnsafe<UserInteraction[]>(query, ...params);

    // Get additional metrics from analytics service
    const serviceMetrics = await analyticsService.getUserEvents(
      type || undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({
      interactions,
      serviceMetrics,
    });
  } catch (error) {
    console.error('User interactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, userId, contentId, metadata } = body;

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    // Create user interaction
    const query = `
      INSERT INTO "UserInteraction" (
        "id", "type", "timestamp", "userId", "contentId", "metadata", "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, NOW(), $3, $4, $5, NOW(), NOW()
      )
      RETURNING *
    `;
    const result = await prisma.$queryRawUnsafe<UserInteraction[]>(
      query,
      crypto.randomUUID(),
      type,
      userId || null,
      contentId || null,
      metadata || {}
    );

    const interaction = result[0];

    // Track user interaction in analytics service
    await analyticsService.trackUserInteraction({
      type: interaction.type,
      timestamp: interaction.timestamp.toISOString(),
      metadata: {
        userId: interaction.userId,
        contentId: interaction.contentId,
        ...interaction.metadata
      }
    });

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('User interaction tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 