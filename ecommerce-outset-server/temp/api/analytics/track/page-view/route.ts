import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, metadata } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    await analyticsService.trackPageView(path, metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
} 