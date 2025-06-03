import { Redis } from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> {
  const data = JSON.stringify(value);
  if (ttl) {
    await redis.setex(key, ttl, data);
  } else {
    await redis.set(key, data);
  }
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}

export async function clearCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
}); 