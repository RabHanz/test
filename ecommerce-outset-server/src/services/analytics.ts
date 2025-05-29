import { Redis } from 'ioredis';
import { prisma } from '../utils/api';
import { google } from 'googleapis';
import { Mailchimp } from '@mailchimp/mailchimp_marketing';
import { Stripe } from 'stripe';
import {
  AnalyticsPlatform,
  FunnelMetrics,
  PersonaMetrics,
  ExitIntentMetrics,
  EmailRecoveryMetrics,
  RetargetingMetrics,
  LeadScoringMetrics,
  RevenueMetrics,
  Alert,
  KeywordMetrics,
  CompetitorMetrics,
  OptimizationRecommendation,
  PlatformData,
  NormalizedMetrics,
  ContentAnalytics,
  PerformanceMetric,
  UserEvent,
  UserInteraction,
} from '../types/analytics';
import { PersonaType } from '../types/persona';
import { v4 as uuidv4 } from 'uuid';

// Type declarations for external modules
declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpMarketing {
    setConfig: (config: { apiKey: string; server: string }) => void;
    lists: {
      getList: (listId: string) => Promise<any>;
      addListMember: (listId: string, data: any) => Promise<any>;
    };
  }
  const mailchimp: MailchimpMarketing;
  export default mailchimp;
}

declare module 'stripe' {
  interface Stripe {
    customers: {
      create: (data: any) => Promise<any>;
      list: (params: any) => Promise<any>;
    };
    charges: {
      create: (data: any) => Promise<any>;
      list: (params: any) => Promise<any>;
    };
  }
  class Stripe {
    constructor(secretKey: string, options?: any);
  }
  export default Stripe;
}

// Analytics Platform Interface
interface AnalyticsPlatform {
  trackEvent: (event: UserEvent) => Promise<void>;
  trackPageView: (path: string, metadata?: Record<string, any>) => Promise<void>;
  trackContentView: (contentId: string, path: string, metadata?: Record<string, any>) => Promise<void>;
  trackSearch: (query: string, path: string, metadata?: Record<string, any>) => Promise<void>;
  trackDownload: (contentId: string, path: string, metadata?: Record<string, any>) => Promise<void>;
  trackInteraction: (interactionType: string, path: string, metadata?: Record<string, any>) => Promise<void>;
  trackPerformance: (metric: PerformanceMetric) => Promise<void>;
  trackContentInteraction: (contentId: string, interactionType: string, metadata?: Record<string, any>) => Promise<void>;
  getContentAnalytics: (contentId: string) => Promise<ContentAnalytics>;
  getPerformanceMetrics: (type?: string, startDate?: Date, endDate?: Date) => Promise<PerformanceMetric[]>;
  getUserEvents: (type?: string, startDate?: Date, endDate?: Date) => Promise<UserEvent[]>;
}

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Cache configuration
const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'analytics:';

// Initialize platform clients
const ga4 = google.analyticsdata('v1beta');
const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY!);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Custom API clients for unavailable packages
class CustomFacebookClient {
  async getInsights() {
    // Implement Facebook API calls using fetch
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/insights?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}&metric=page_impressions,page_engaged_users,page_posts_impressions&period=day`
    );
    return response.json();
  }
}

class CustomClickUpClient {
  async getTasks(spaceId: string) {
    // Implement ClickUp API calls using fetch
    const response = await fetch(
      `https://api.clickup.com/api/v2/space/${spaceId}/task?include_closed=true`,
      {
        headers: {
          Authorization: process.env.CLICKUP_API_KEY!,
        },
      }
    );
    return response.json();
  }
}

class CustomTeachableClient {
  async getCourses() {
    // Implement Teachable API calls using fetch
    const response = await fetch(
      `https://developers.teachable.com/v1/courses`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TEACHABLE_API_KEY}`,
        },
      }
    );
    return response.json();
  }
}

class CustomSemrushClient {
  async getKeywordMetrics(keywords: string[]) {
    // Implement SEMrush API calls using fetch
    const response = await fetch(
      `https://api.semrush.com/analytics/v1/?type=phrase_this&key=${process.env.SEMRUSH_API_KEY}&phrase=${keywords.join(',')}&database=us`
    );
    return response.json();
  }
}

const fb = new CustomFacebookClient();
const clickup = new CustomClickUpClient();
const teachable = new CustomTeachableClient();
const semrush = new CustomSemrushClient();

interface LeadCaptureEvent {
  email: string;
  calculatorType: string;
  score: number;
  personaType?: PersonaType;
  leadScore?: {
    totalScore: number;
    qualification: 'Hot' | 'Warm' | 'Cold';
  };
}

export interface AnalyticsService {
  // Tracking methods
  trackPageView(pagePath: string, metadata?: Record<string, any>): Promise<void>;
  trackContentView(contentId: string, path: string, metadata?: Record<string, any>): Promise<void>;
  trackSearch(query: string, path: string, metadata?: Record<string, any>): Promise<void>;
  trackDownload(contentId: string, path: string, metadata?: Record<string, any>): Promise<void>;
  trackInteraction(interactionType: string, path: string, metadata?: Record<string, any>): Promise<void>;
  trackPerformance(metric: PerformanceMetric): Promise<void>;
  trackContentInteraction(contentId: string, interactionType: string, metadata?: Record<string, any>): Promise<void>;

  // Analytics retrieval methods
  getContentAnalytics(contentId: string): Promise<ContentAnalytics>;
  getPerformanceMetrics(type?: string, startDate?: Date, endDate?: Date): Promise<PerformanceMetric[]>;
  getUserEvents(type?: string, startDate?: Date, endDate?: Date): Promise<UserEvent[]>;
  getFunnelMetrics(startDate?: Date, endDate?: Date): Promise<FunnelMetrics>;
  getExitIntentMetrics(startDate?: Date, endDate?: Date): Promise<ExitIntentMetrics>;
  getLeadScoringMetrics(): Promise<LeadScoringMetrics>;
  getRevenueMetrics(startDate?: Date, endDate?: Date): Promise<RevenueMetrics>;
  getAlerts(): Promise<Alert[]>;
  getRecommendations(): Promise<OptimizationRecommendation[]>;
}

class AnalyticsServiceImpl implements AnalyticsService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/analytics') {
    this.baseUrl = baseUrl;
  }

  async trackPageView(pagePath: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/page-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagePath, metadata }),
    });
  }

  async trackContentView(contentId: string, path: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/content-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId, path, metadata }),
    });
  }

  async trackSearch(query: string, path: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, path, metadata }),
    });
  }

  async trackDownload(contentId: string, path: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId, path, metadata }),
    });
  }

  async trackInteraction(interactionType: string, path: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interactionType, path, metadata }),
    });
  }

  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    await fetch(`${this.baseUrl}/track/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    });
  }

  async trackContentInteraction(contentId: string, interactionType: string, metadata?: Record<string, any>): Promise<void> {
    await fetch(`${this.baseUrl}/track/content-interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId, interactionType, metadata }),
    });
  }

  async getContentAnalytics(contentId: string): Promise<ContentAnalytics> {
    const response = await fetch(`${this.baseUrl}/content/${contentId}`);
    if (!response.ok) throw new Error('Failed to fetch content analytics');
    return response.json();
  }

  async getPerformanceMetrics(type?: string, startDate?: Date, endDate?: Date): Promise<PerformanceMetric[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/performance?${params}`);
    if (!response.ok) throw new Error('Failed to fetch performance metrics');
    return response.json();
  }

  async getUserEvents(type?: string, startDate?: Date, endDate?: Date): Promise<UserEvent[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/events?${params}`);
    if (!response.ok) throw new Error('Failed to fetch user events');
    return response.json();
  }

  async getFunnelMetrics(startDate?: Date, endDate?: Date): Promise<FunnelMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/funnel?${params}`);
    if (!response.ok) throw new Error('Failed to fetch funnel metrics');
    return response.json();
  }

  async getExitIntentMetrics(startDate?: Date, endDate?: Date): Promise<ExitIntentMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/exit-intent?${params}`);
    if (!response.ok) throw new Error('Failed to fetch exit intent metrics');
    return response.json();
  }

  async getLeadScoringMetrics(): Promise<LeadScoringMetrics> {
    const response = await fetch(`${this.baseUrl}/lead-scoring`);
    if (!response.ok) throw new Error('Failed to fetch lead scoring metrics');
    return response.json();
  }

  async getRevenueMetrics(startDate?: Date, endDate?: Date): Promise<RevenueMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await fetch(`${this.baseUrl}/revenue?${params}`);
    if (!response.ok) throw new Error('Failed to fetch revenue metrics');
    return response.json();
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${this.baseUrl}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }

  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    const response = await fetch(`${this.baseUrl}/recommendations`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  }
}

export const analyticsService = new AnalyticsServiceImpl(); 