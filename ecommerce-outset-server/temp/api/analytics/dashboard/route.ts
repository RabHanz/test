import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import type { DashboardData } from '@/types/analytics';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
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
    const [totalUsers, activeUsers, totalOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastInteraction: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

    // Fetch top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Fetch recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate user growth (last 7 days)
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Calculate revenue by day (last 7 days)
    const revenueByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const dashboardData: DashboardData = {
      totalUsers,
      activeUsers,
      totalOrders,
      revenue: revenue._sum.total || 0,
      topProducts: await Promise.all(
        topProducts.map(async (product) => {
          const productDetails = await prisma.product.findUnique({
            where: { id: product.productId },
            select: { name: true },
          });
          return {
            id: product.productId,
            name: productDetails?.name || 'Unknown Product',
            sales: product._sum.quantity || 0,
          };
        })
      ),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
      userGrowth: userGrowth.map((day) => ({
        date: day.createdAt.toISOString(),
        count: day._count,
      })),
      revenueByDay: revenueByDay.map((day) => ({
        date: day.createdAt.toISOString(),
        amount: day._sum.total || 0,
      })),
      performance: {
        pageLoad: performanceMetrics?.averageProcessingTime || 0,
        timeToInteractive: 1.2,
        firstContentfulPaint: 0.8,
        cumulativeLayoutShift: 0.1,
      },
      analytics: {
        visitors: totalUsers,
        pageViews: await prisma.userEvent.count({
          where: { type: 'PAGE_VIEW' },
        }),
        bounceRate: 35.5,
        averageSessionDuration: 180,
        conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
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