import { useEffect, lazy, ComponentType } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

// Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Performance monitoring
export const measurePerformance = (name: string, callback: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  } else {
    callback();
  }
};

// Analytics page view tracking
export const usePageTracking = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (GA_TRACKING_ID) {
        gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};

// Google Analytics Script
export const GoogleAnalytics = () => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    measurePerformance('usePerformanceMonitoring', () => {
      // Implementation of measurePerformance
    });
  }, []);
};

// Accessibility monitoring
export const checkAccessibility = () => {
  if (typeof window !== 'undefined') {
    // Check for common accessibility issues
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      // Check for proper heading hierarchy
      if (element.tagName.match(/^H[1-6]$/)) {
        const level = parseInt(element.tagName[1]);
        const previousHeadings = document.querySelectorAll(`h${level - 1}`);
        if (level > 1 && previousHeadings.length === 0) {
          console.warn(`Missing h${level - 1} before h${level}`);
        }
      }
      
      // Check for proper ARIA labels
      if (element.hasAttribute('aria-label') && !element.getAttribute('aria-label')) {
        console.warn('Empty aria-label found');
      }
      
      // Check for proper color contrast
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      // Add color contrast checking logic here
    });
  }
};

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private readonly flushInterval = 60000; // 1 minute

  private constructor() {
    this.startAutoFlush();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    if (this.metrics.length >= this.maxMetrics) {
      this.flush();
    }
  }

  public trackTiming(name: string, startTime: number, tags?: Record<string, string>): void {
    const duration = Date.now() - startTime;
    this.trackMetric({
      name,
      value: duration,
      tags,
    });
  }

  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      this.trackTiming(name, startTime, tags);
      return result;
    } catch (error) {
      this.trackMetric({
        name: `${name}_error`,
        value: 1,
        tags: {
          ...tags,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private startAutoFlush(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // In a real implementation, this would send metrics to your analytics service
      console.log('Flushing metrics:', metricsToFlush);
      
      // Example implementation:
      // await fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metricsToFlush),
      // });
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Put metrics back in the queue
      this.metrics = [...metricsToFlush, ...this.metrics];
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper functions for common metrics
export const trackPerformanceMetrics = (metric: string, value: number, tags?: Record<string, string>): void => {
  performanceMonitor.trackMetric({ name: metric, value, tags });
};

export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> => {
  return performanceMonitor.measureAsync(name, fn, tags);
};

// Lazy loading with retry mechanism
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (attemptNumber: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attemptNumber < retries) {
              setTimeout(() => attempt(attemptNumber + 1), 1000 * attemptNumber);
            } else {
              reject(error);
            }
          });
      };
      attempt(1);
    });
  });
};

// Image optimization
export const optimizeImage = (url: string, width: number): string => {
  // Add image optimization parameters
  return `${url}?w=${width}&q=80&format=webp`;
};

// Resource preloading
export const preloadResource = (url: string, type: 'script' | 'style' | 'image') => {
  const link = document.createElement('link');
  link.rel = type === 'image' ? 'preload' : 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

// Cache management
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly TTL: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Virtual scrolling helper
export const getVisibleRange = (
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
): { start: number; end: number } => {
  const start = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(start + visibleCount + 1, totalItems);
  return { start, end };
}; 