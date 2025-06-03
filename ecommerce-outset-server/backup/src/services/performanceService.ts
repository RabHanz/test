import { isFeatureEnabled } from '../../shared/config/features';
import { monitoringService } from './monitoringService';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface PerformanceThreshold {
  name: string;
  threshold: number;
  severity: 'warning' | 'error';
}

class PerformanceService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private readonly MAX_METRICS_PER_NAME = 100;

  constructor() {
    this.initializeThresholds();
  }

  private initializeThresholds(): void {
    this.thresholds.set('pageLoad', { name: 'Page Load Time', threshold: 3000, severity: 'warning' });
    this.thresholds.set('apiResponse', { name: 'API Response Time', threshold: 1000, severity: 'warning' });
    this.thresholds.set('renderTime', { name: 'Component Render Time', threshold: 100, severity: 'warning' });
  }

  public trackMetric(name: string, value: number, unit: string = 'ms'): void {
    if (!isFeatureEnabled('ENABLE_PERFORMANCE_MONITORING')) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only the last MAX_METRICS_PER_NAME metrics
    if (metrics.length > this.MAX_METRICS_PER_NAME) {
      metrics.shift();
    }

    this.checkThreshold(name, value);
  }

  private checkThreshold(name: string, value: number): void {
    const threshold = this.thresholds.get(name);
    if (!threshold) return;

    if (value > threshold.threshold) {
      monitoringService.trackUserExperience({
        interactionType: 'performance',
        duration: value,
        success: false,
        context: {
          metric: name,
          threshold: threshold.threshold,
          severity: threshold.severity
        }
      });
    }
  }

  public getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  public getAverageMetric(name: string): number {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  public getMetricsSummary(): Record<string, { average: number; min: number; max: number }> {
    const summary: Record<string, { average: number; min: number; max: number }> = {};

    this.metrics.forEach((metrics, name) => {
      if (metrics.length === 0) return;

      const values = metrics.map(m => m.value);
      summary[name] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });

    return summary;
  }

  public clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceService = new PerformanceService(); 