import { NextApiRequest, NextApiResponse } from 'next';
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
      for (const [ip, timestamps] of this.requests.entries()) {
        const validTimestamps = timestamps.filter(
          timestamp => now - timestamp < this.config.windowMs
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
    return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      if (!ip || typeof ip !== 'string') {
        return res.status(400).json({ error: 'Invalid IP address' });
      }

      const now = Date.now();
      const userRequests = this.requests.get(ip) || [];
      const validRequests = userRequests.filter(
        timestamp => now - timestamp < this.config.windowMs
      );

      if (validRequests.length >= this.config.maxRequests) {
        monitoringService.trackError(new Error('Rate limit exceeded'), {
          ip,
          endpoint: req.url,
          method: req.method,
        });

        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(
            (validRequests[0] + this.config.windowMs - now) / 1000
          ),
        });
      }

      validRequests.push(now);
      this.requests.set(ip, validRequests);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.config.maxRequests - validRequests.length);
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil((validRequests[0] + this.config.windowMs) / 1000)
      );

      next();
    };
  }
}

export const rateLimiter = RateLimiter.getInstance(); 