import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitoringService } from '../services/monitoringService';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
};

class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  private constructor(config: RateLimitConfig = defaultConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  public static getInstance(config?: RateLimitConfig): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter(config);
    }
    return RateLimiter.instance;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [ip, timestamps] of Array.from(this.requests.entries())) {
        const validTimestamps = timestamps.filter(
          (timestamp: number) => now - timestamp < this.config.windowMs
        );
        if (validTimestamps.length === 0) {
          this.requests.delete(ip);
        } else {
          this.requests.set(ip, validTimestamps);
        }
      }
    }, this.config.windowMs);
  }

  public middleware() {
    return async (request: NextRequest) => {
      const ip = request.headers.get('x-forwarded-for') || request.ip;
      
      if (!ip) {
        return NextResponse.json(
          { error: 'Invalid IP address' },
          { status: 400 }
        );
      }

      const now = Date.now();
      const userRequests = this.requests.get(ip) || [];
      const validRequests = userRequests.filter(
        (timestamp: number) => now - timestamp < this.config.windowMs
      );

      if (validRequests.length >= this.config.maxRequests) {
        monitoringService.trackError(new Error('Rate limit exceeded'), {
          ip,
          endpoint: request.url,
          method: request.method,
        });

        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil(
              (validRequests[0] + this.config.windowMs - now) / 1000
            ),
          },
          { status: 429 }
        );
      }

      validRequests.push(now);
      this.requests.set(ip, validRequests);

      const response = NextResponse.next();

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (this.config.maxRequests - validRequests.length).toString());
      response.headers.set(
        'X-RateLimit-Reset',
        Math.ceil((validRequests[0] + this.config.windowMs) / 1000).toString()
      );

      return response;
    };
  }
}

export const rateLimiter = RateLimiter.getInstance(); 