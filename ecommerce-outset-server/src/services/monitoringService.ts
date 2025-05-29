import axios from 'axios';
import { Analytics } from '@segment/analytics-node';

// Initialize Segment analytics
const analytics = new Analytics({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '',
});

interface MonitoringEvent {
  type: 'error' | 'performance' | 'user_action' | 'user_experience';
  name: string;
  data: any;
  timestamp: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
}

interface UserExperienceMetric {
  type: 'interaction' | 'navigation' | 'form' | 'search';
  name: string;
  duration?: number;
  success?: boolean;
  error?: string;
  context: Record<string, any>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private events: MonitoringEvent[] = [];
  private readonly MAX_EVENTS = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute
  private interactionStartTimes: Map<string, number> = new Map();

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private startPeriodicFlush(): void {
    setInterval(() => this.flushEvents(), this.FLUSH_INTERVAL);
  }

  public trackError(error: Error, context: any = {}): void {
    this.trackEvent({
      type: 'error',
      name: error.name,
      data: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      timestamp: Date.now(),
    });
  }

  public trackPerformance(metric: PerformanceMetric): void {
    this.trackEvent({
      type: 'performance',
      name: metric.name,
      data: {
        value: metric.value,
        tags: metric.tags,
      },
      timestamp: Date.now(),
    });
  }

  public trackUserAction(action: string, data: any = {}): void {
    this.trackEvent({
      type: 'user_action',
      name: action,
      data,
      timestamp: Date.now(),
    });
  }

  public startInteractionTracking(interactionId: string): void {
    this.interactionStartTimes.set(interactionId, Date.now());
  }

  public trackUserExperience(metric: UserExperienceMetric): void {
    const startTime = this.interactionStartTimes.get(metric.name);
    const duration = startTime ? Date.now() - startTime : undefined;
    this.interactionStartTimes.delete(metric.name);

    this.trackEvent({
      type: 'user_experience',
      name: metric.name,
      data: {
        type: metric.type,
        duration,
        success: metric.success,
        error: metric.error,
        context: metric.context,
      },
      timestamp: Date.now(),
    });
  }

  private trackEvent(event: MonitoringEvent): void {
    this.events.push(event);
    if (this.events.length >= this.MAX_EVENTS) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Send to analytics
      eventsToFlush.forEach(event => {
        analytics.track({
          event: event.name,
          properties: event.data,
          timestamp: new Date(event.timestamp),
        });
      });

      // Send to monitoring API
      await axios.post('/api/monitoring/events', {
        events: eventsToFlush,
      });
    } catch (error) {
      console.error('Failed to flush monitoring events:', error);
      // Put events back in queue
      this.events = [...eventsToFlush, ...this.events];
    }
  }
}

export const monitoringService = MonitoringService.getInstance(); 