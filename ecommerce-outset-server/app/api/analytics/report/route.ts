import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import type { AnalyticsData } from '@/types';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required date range' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch analytics data for the specified time range
    const [visitors, pageViews, orders] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.automationLog.count({
        where: {
          timestamp: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    // Calculate bounce rate (simplified example)
    const bounceRate = 35.5; // This would be calculated based on actual user behavior

    // Calculate conversion rate
    const conversionRate = orders > 0 ? (orders / visitors) * 100 : 0;

    const reportData: AnalyticsData = {
      visitors,
      pageViews,
      bounceRate,
      averageSessionDuration: 180, // Example value in seconds
      conversionRate,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Analytics Report API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 