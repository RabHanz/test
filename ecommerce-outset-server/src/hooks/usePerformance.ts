import { useEffect, useRef } from 'react';
import { performanceService } from '../services/performanceService';

interface UsePerformanceOptions {
  name: string;
  enabled?: boolean;
}

export const usePerformance = ({ name, enabled = true }: UsePerformanceOptions) => {
  const startTime = useRef<number>(0);
  const componentName = useRef<string>(name);

  useEffect(() => {
    if (!enabled) return;

    startTime.current = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;
      performanceService.trackMetric(componentName.current, duration);
    };
  }, [enabled]);

  const trackOperation = (operationName: string) => {
    if (!enabled) return;

    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      performanceService.trackMetric(`${componentName.current}.${operationName}`, duration);
    };
  };

  const getMetrics = () => {
    return {
      component: performanceService.getMetrics(componentName.current),
      summary: performanceService.getMetricsSummary()
    };
  };

  return {
    trackOperation,
    getMetrics
  };
}; 