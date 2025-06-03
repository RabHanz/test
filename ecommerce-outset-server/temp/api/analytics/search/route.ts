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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const searches = await analyticsService.getUserEvents(
      'search',
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({ searches });
  } catch (error) {
    console.error('Search retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve searches' },
      { status: 500 }
    );
  }
} 