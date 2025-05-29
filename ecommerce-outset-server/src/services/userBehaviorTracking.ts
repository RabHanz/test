import { ResourceMetadata } from '../config/resourceClassification';
import { analyticsService } from './analytics';

export interface UserBehaviorEvent {
  userId: string;
  resourceId: string;
  eventType: 'view' | 'download' | 'complete' | 'rate' | 'feedback';
  timestamp: Date;
  metadata?: {
    duration?: number;
    progress?: number;
    rating?: number;
    feedback?: string;
    category?: string;
    format?: string;
  };
}

export class UserBehaviorTrackingService {
  private readonly STORAGE_KEY = 'user_behavior_events';
  private events: UserBehaviorEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  private loadEvents() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.events = JSON.parse(stored).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    }
  }

  private saveEvents() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
  }

  trackResourceView(
    userId: string,
    resource: ResourceMetadata,
    duration?: number
  ) {
    const event: UserBehaviorEvent = {
      userId,
      resourceId: resource.id,
      eventType: 'view',
      timestamp: new Date(),
      metadata: {
        duration,
        category: resource.category,
        format: resource.format,
      },
    };

    this.events.push(event);
    this.saveEvents();
    analyticsService.trackResourceView(resource.id, resource.format);
  }

  trackResourceDownload(userId: string, resource: ResourceMetadata) {
    const event: UserBehaviorEvent = {
      userId,
      resourceId: resource.id,
      eventType: 'download',
      timestamp: new Date(),
      metadata: {
        category: resource.category,
        format: resource.format,
      },
    };

    this.events.push(event);
    this.saveEvents();
    analyticsService.trackTemplateDownload(resource.id);
  }

  trackResourceComplete(
    userId: string,
    resource: ResourceMetadata,
    progress: number
  ) {
    const event: UserBehaviorEvent = {
      userId,
      resourceId: resource.id,
      eventType: 'complete',
      timestamp: new Date(),
      metadata: {
        progress,
        category: resource.category,
        format: resource.format,
      },
    };

    this.events.push(event);
    this.saveEvents();
    analyticsService.trackResourceComplete(resource.id, progress);
  }

  trackResourceRating(
    userId: string,
    resource: ResourceMetadata,
    rating: number
  ) {
    const event: UserBehaviorEvent = {
      userId,
      resourceId: resource.id,
      eventType: 'rate',
      timestamp: new Date(),
      metadata: {
        rating,
        category: resource.category,
        format: resource.format,
      },
    };

    this.events.push(event);
    this.saveEvents();
    analyticsService.trackResourceRating(resource.id, rating);
  }

  trackResourceFeedback(
    userId: string,
    resource: ResourceMetadata,
    feedback: string
  ) {
    const event: UserBehaviorEvent = {
      userId,
      resourceId: resource.id,
      eventType: 'feedback',
      timestamp: new Date(),
      metadata: {
        feedback,
        category: resource.category,
        format: resource.format,
      },
    };

    this.events.push(event);
    this.saveEvents();
    analyticsService.trackResourceFeedback(resource.id, feedback);
  }

  getUserBehavior(userId: string): UserBehaviorEvent[] {
    return this.events.filter((event) => event.userId === userId);
  }

  getResourceStats(resourceId: string) {
    const resourceEvents = this.events.filter(
      (event) => event.resourceId === resourceId
    );

    return {
      views: resourceEvents.filter((e) => e.eventType === 'view').length,
      downloads: resourceEvents.filter((e) => e.eventType === 'download').length,
      completions: resourceEvents.filter((e) => e.eventType === 'complete').length,
      averageRating:
        resourceEvents
          .filter((e) => e.eventType === 'rate')
          .reduce((acc, curr) => acc + (curr.metadata?.rating || 0), 0) /
        resourceEvents.filter((e) => e.eventType === 'rate').length || 0,
      feedback: resourceEvents
        .filter((e) => e.eventType === 'feedback')
        .map((e) => e.metadata?.feedback),
    };
  }
} 