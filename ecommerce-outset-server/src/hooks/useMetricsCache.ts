import { useState, useEffect, useCallback } from 'react';
import { PlatformType, PlatformMetrics } from '../types/optimizationHub';
import { getPlatformMetrics } from '../services/optimizationHubService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

interface CacheOptions {
  staleTime?: number; // Time in ms before data is considered stale
  cacheTime?: number; // Time in ms before data is removed from cache
}

const DEFAULT_OPTIONS: CacheOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
};

export const useMetricsCache = (
  platformType: PlatformType,
  options: CacheOptions = {}
) => {
  const [cache, setCache] = useState<Map<PlatformType, CacheEntry<PlatformMetrics>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPlatformMetrics();
      const timestamp = Date.now();

      setCache(prev => {
        const newCache = new Map(prev);
        data.forEach(metric => {
          newCache.set(metric.platformType, {
            data: metric,
            timestamp,
            isStale: false,
          });
        });
        return newCache;
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCachedData = useCallback(() => {
    const entry = cache.get(platformType);
    if (!entry) return null;

    const now = Date.now();
    const isStale = now - entry.timestamp > mergedOptions.staleTime!;
    const isExpired = now - entry.timestamp > mergedOptions.cacheTime!;

    if (isExpired) {
      cache.delete(platformType);
      return null;
    }

    return {
      ...entry,
      isStale,
    };
  }, [cache, platformType, mergedOptions.staleTime, mergedOptions.cacheTime]);

  useEffect(() => {
    const cachedData = getCachedData();
    
    if (!cachedData) {
      fetchData();
    } else if (cachedData.isStale) {
      // Fetch in background while returning stale data
      fetchData();
    }
  }, [platformType, getCachedData, fetchData]);

  const invalidateCache = useCallback(() => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(platformType);
      return newCache;
    });
  }, [platformType]);

  const cachedData = getCachedData();

  return {
    data: cachedData?.data,
    isLoading,
    error,
    isStale: cachedData?.isStale ?? false,
    refetch: fetchData,
    invalidate: invalidateCache,
  };
}; 