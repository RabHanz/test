import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, path, metadata } = body;

    if (!contentId || !path) {
      return NextResponse.json(
        { error: 'Content ID and path are required' },
        { status: 400 }
      );
    }

    await analyticsService.trackDownload(contentId, path, metadata);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
} 