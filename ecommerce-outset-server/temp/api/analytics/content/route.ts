import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';
import { prisma } from '@/lib/prisma';

interface ContentAnalytics {
  id: string;
  contentId: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Get content analytics from database
    const analytics = await prisma.$queryRaw<ContentAnalytics[]>`
      SELECT * FROM "ContentAnalytics"
      WHERE "contentId" = ${contentId}
    `;

    if (!analytics || analytics.length === 0) {
      return NextResponse.json({ error: 'Content analytics not found' }, { status: 404 });
    }

    // Get additional metrics from analytics service
    const metrics = await analyticsService.getContentAnalytics(contentId);

    return NextResponse.json({
      ...analytics[0],
      metrics,
    });
  } catch (error) {
    console.error('Content analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contentId, type, ...data } = body;

    if (!contentId || !type) {
      return NextResponse.json({ error: 'Content ID and type are required' }, { status: 400 });
    }

    // Get existing analytics
    const existing = await prisma.$queryRaw<ContentAnalytics[]>`
      SELECT * FROM "ContentAnalytics"
      WHERE "contentId" = ${contentId}
    `;

    let analytics: ContentAnalytics;
    if (!existing || existing.length === 0) {
      // Create new analytics
      const result = await prisma.$queryRaw<ContentAnalytics[]>`
        INSERT INTO "ContentAnalytics" (
          "id", "contentId", "views", "uniqueViews", "averageTimeOnPage", 
          "bounceRate", "conversionRate", "createdAt", "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()}, ${contentId},
          ${type === 'view' ? 1 : 0},
          ${type === 'unique_view' ? 1 : 0},
          ${type === 'time_on_page' ? data.duration : 0},
          ${type === 'bounce' ? 100 : 0},
          ${type === 'conversion' ? 100 : 0},
          NOW(), NOW()
        )
        RETURNING *
      `;
      analytics = result[0];
    } else {
      // Update existing analytics
      const current = existing[0];
      const result = await prisma.$queryRaw<ContentAnalytics[]>`
        UPDATE "ContentAnalytics"
        SET
          "views" = ${type === 'view' ? current.views + 1 : current.views},
          "uniqueViews" = ${type === 'unique_view' ? current.uniqueViews + 1 : current.uniqueViews},
          "averageTimeOnPage" = ${type === 'time_on_page' ? (current.averageTimeOnPage + data.duration) / 2 : current.averageTimeOnPage},
          "bounceRate" = ${type === 'bounce' ? (current.bounceRate + 100) / 2 : current.bounceRate},
          "conversionRate" = ${type === 'conversion' ? (current.conversionRate + 100) / 2 : current.conversionRate},
          "updatedAt" = NOW()
        WHERE "contentId" = ${contentId}
        RETURNING *
      `;
      analytics = result[0];
    }

    // Track content interaction in analytics service
    await analyticsService.trackContentInteraction(contentId, type, data);

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Content analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 