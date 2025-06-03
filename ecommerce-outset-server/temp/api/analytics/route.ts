import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, data } = body;

    // Here you would typically send this to your analytics service
    console.log('Analytics event:', { eventName, data });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Analytics API is running' });
} 