import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Dashboard endpoint - Session retrieved by getServerSession:', session);

    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('Dashboard endpoint - Unauthorized access attempt:', session);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch performance metrics from the database
    const performanceMetrics = await prisma.automationMetrics.findFirst({
      where: {
        workflow: {
          type: 'WORKFLOW',
        },
      },
      orderBy: {
        lastExecution: 'desc',
      },
    });

    // Fetch analytics data
    const [visitors, pageViews, orders] = await Promise.all([
      prisma.user.count(),
      prisma.automationLog.count(),
      prisma.order.count(),
    ]);

    // Calculate bounce rate (simplified example)
    const bounceRate = 35.5; // This would be calculated based on actual user behavior

    // Calculate conversion rate
    const conversionRate = orders > 0 ? (orders / visitors) * 100 : 0;

    const dashboardData = {
      performance: {
        pageLoad: performanceMetrics?.averageProcessingTime || 0,
        timeToInteractive: 1.2, // Example value
        firstContentfulPaint: 0.8, // Example value
        cumulativeLayoutShift: 0.1, // Example value
      },
      analytics: {
        visitors,
        pageViews,
        bounceRate,
        averageSessionDuration: 180, // Example value in seconds
        conversionRate,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}