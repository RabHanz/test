import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

interface PerformanceMetric {
  id: string;
  type: string;
  value: number;
  timestamp: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const performance = await analyticsService.getPerformanceMetrics(
      'performance',
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({ performance });
  } catch (error) {
    console.error('Performance retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, metrics, metadata } = body;

    if (!path || !metrics) {
      return NextResponse.json(
        { error: 'Path and metrics are required' },
        { status: 400 }
      );
    }

    await analyticsService.trackPerformance({
      type: 'performance',
      value: metrics,
      timestamp: new Date().toISOString(),
      metadata: {
        path,
        ...metadata
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Performance tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track performance' },
      { status: 500 }
    );
  }
} 