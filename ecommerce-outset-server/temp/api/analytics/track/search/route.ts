import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, path, metadata } = body;

    if (!query || !path) {
      return NextResponse.json(
        { error: 'Query and path are required' },
        { status: 400 }
      );
    }

    await analyticsService.trackSearch(query, path, metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track search' },
      { status: 500 }
    );
  }
} 