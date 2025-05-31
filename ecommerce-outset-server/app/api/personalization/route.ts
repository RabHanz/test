import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { PrismaClient } from '@prisma/client';
import type { PersonaType, EngagementLevel } from '@/types/personalization';

const prisma = new PrismaClient();
// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); // Comment out direct ioredis import

export async function POST(request: Request) {
  try {
    const { personaId, engagementLevel } = await request.json();

    // Validate input
    if (!personaId || !engagementLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = `personalization:${personaId}:${engagementLevel}`;
    const cachedContent = await redis.get(cacheKey);

    if (cachedContent) {
      return NextResponse.json(JSON.parse(cachedContent));
    }

    // If not in cache, fetch from database
    const personalizationRules = await prisma.personalizationRule.findMany({
      where: {
        personaId: personaId as PersonaType,
        engagementLevel: engagementLevel as EngagementLevel,
        isActive: true,
      },
      include: {
        content: true,
      },
    });

    // Transform rules into content map
    const contentMap = personalizationRules.reduce((acc, rule) => {
      acc[rule.contentKey] = rule.content.value;
      return acc;
    }, {} as Record<string, any>);

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(contentMap), 'EX', 3600); // Cache for 1 hour

    return NextResponse.json(contentMap);
  } catch (error) {
    console.error('Personalization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // TODO: Replace with real personalization logic
  return NextResponse.json({ data: 'Personalization data placeholder' });
} 