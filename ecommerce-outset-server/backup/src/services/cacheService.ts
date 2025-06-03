import { monitoringService } from './monitoringService';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
  staleWhileRevalidate: boolean; // Whether to serve stale data while revalidating
  revalidateInterval: number; // How often to revalidate stale data
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  lastAccessed: number;
  accessCount: number;
  isStale: boolean;
}

interface CacheStats {
  size: number;
  hitRate: number;
  staleRate: number;
  averageAccessCount: number;
  mostAccessedKeys: string[];
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;
  private revalidateInterval: NodeJS.Timeout;
  private totalHits: number = 0;
  private totalMisses: number = 0;

  private constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
    this.startRevalidateInterval();
  }

  public static getInstance(config: CacheConfig): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.ttl);
  }

  private startRevalidateInterval(): void {
    if (this.config.staleWhileRevalidate) {
      this.revalidateInterval = setInterval(() => {
        this.revalidateStaleItems();
      }, this.config.revalidateInterval);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt <= now) {
        this.cache.delete(key);
      }
    }

    // If cache is still too large, remove least accessed items
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => {
        // Sort by last accessed time and access count
        const timeDiff = b[1].lastAccessed - a[1].lastAccessed;
        if (timeDiff !== 0) return timeDiff;
        return b[1].accessCount - a[1].accessCount;
      });
      const itemsToRemove = entries.slice(0, entries.length - this.config.maxSize);
      itemsToRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private revalidateStaleItems(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.isStale) {
        // Trigger revalidation event
        monitoringService.trackUserExperience({
          type: 'interaction',
          name: 'cache_revalidation',
          context: { key, lastAccessed: item.lastAccessed }
        });
      }
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      this.totalMisses++;
      monitoringService.trackPerformance({
        name: 'cache_miss',
        value: 1,
        tags: { key },
      });
      return null;
    }

    const now = Date.now();
    item.lastAccessed = now;
    item.accessCount++;

    if (item.expiresAt <= now) {
      if (this.config.staleWhileRevalidate) {
        item.isStale = true;
        this.totalHits++;
        monitoringService.trackPerformance({
          name: 'cache_stale_hit',
          value: 1,
          tags: { key },
        });
        return item.data as T;
      } else {
        this.cache.delete(key);
        this.totalMisses++;
        monitoringService.trackPerformance({
          name: 'cache_expired',
          value: 1,
          tags: { key },
        });
        return null;
      }
    }

    this.totalHits++;
    monitoringService.trackPerformance({
      name: 'cache_hit',
      value: 1,
      tags: { key },
    });
    return item.data as T;
  }

  public set<T>(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const ttl = customTtl || this.config.ttl;
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      lastAccessed: now,
      accessCount: 0,
      isStale: false,
    });

    // If cache is too large, remove least accessed items
    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  public getStats(): CacheStats {
    const total = this.totalHits + this.totalMisses;
    const entries = Array.from(this.cache.entries());
    const totalAccessCount = entries.reduce((sum, [_, item]) => sum + item.accessCount, 0);
    const staleCount = entries.filter(([_, item]) => item.isStale).length;

    return {
      size: this.cache.size,
      hitRate: total > 0 ? this.totalHits / total : 0,
      staleRate: this.cache.size > 0 ? staleCount / this.cache.size : 0,
      averageAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      mostAccessedKeys: entries
        .sort((a, b) => b[1].accessCount - a[1].accessCount)
        .slice(0, 5)
        .map(([key]) => key),
    };
  }
}

export const cacheService = CacheService.getInstance({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000, // Maximum 1000 items in cache
  staleWhileRevalidate: true,
  revalidateInterval: 60 * 1000, // Revalidate every minute
}); 