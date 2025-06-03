import { useState, useEffect } from 'react';
import type { PerformanceMetrics } from '../types/performance';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoad: 0,
    timeToInteractive: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Get performance metrics
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const layoutShift = performance.getEntriesByType('layout-shift');

      // Calculate metrics
      const pageLoad = navigation.loadEventEnd - navigation.startTime;
      const timeToInteractive = navigation.domInteractive - navigation.startTime;
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const largestContentfulPaint = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
      const cumulativeLayoutShift = layoutShift.reduce((sum, entry) => sum + (entry as any).value, 0);

      setMetrics({
        pageLoad,
        timeToInteractive,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
      });
    }
  }, []);

  return metrics;
} 