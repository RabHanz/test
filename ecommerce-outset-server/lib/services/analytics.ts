import { BaseService } from './BaseService';
import { redis } from '../redis';
import { prisma } from '../prisma';
import { google } from 'googleapis';
import Mailchimp from '@mailchimp/mailchimp_marketing';
import Stripe from 'stripe';
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
  AnalyticsFilter,
} from '@/types/analytics';
import { PersonaType } from '@/types/persona';
import { v4 as uuidv4 } from 'uuid';

// Cache configuration
const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'analytics:';

// Initialize platform clients (made optional)
const ga4 = google.analyticsdata('v1beta');
const mailchimpClient = process.env.MAILCHIMP_API_KEY ? Mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX || 'us1'
}) : null;
const stripeClient = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY!) : null;

// Custom API clients for unavailable packages
class CustomFacebookClient {
  async getInsights() {
    // Implement Facebook API calls using fetch
    if (!process.env.FACEBOOK_ACCESS_TOKEN) {
      console.warn('Facebook integration not configured');
      return null;
    }
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/me/insights?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}&metric=page_impressions,page_engaged_users,page_posts_impressions&period=day`
    );
    if (!response.ok) {
       console.error('Error fetching Facebook insights:', response.statusText);
       return null;
    }
    return response.json();
  }
}

class CustomClickUpClient {
  async getTasks(spaceId?: string) {
     if (!process.env.CLICKUP_API_KEY || !spaceId) {
      console.warn('ClickUp integration not configured or spaceId is missing');
      return null;
    }
    // Implement ClickUp API calls using fetch
    const response = await fetch(
      `https://api.clickup.com/api/v2/space/${spaceId}/task?include_closed=true`,
      {
        headers: {
          Authorization: process.env.CLICKUP_API_KEY!,
        },
      }
    );
     if (!response.ok) {
       console.error('Error fetching ClickUp tasks:', response.statusText);
       return null;
     }
    return response.json();
  }
}

class CustomTeachableClient {
  async getCourses() {
    if (!process.env.TEACHABLE_API_KEY) {
      console.warn('Teachable integration not configured');
      return null;
    }
    // Implement Teachable API calls using fetch
    const response = await fetch(
      `https://developers.teachable.com/v1/courses`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TEACHABLE_API_KEY}`,
        },
      }
    );
    if (!response.ok) {
      console.error('Error fetching Teachable courses:', response.statusText);
      return null;
    }
    return response.json();
  }
}

class CustomSemrushClient {
  async getKeywordMetrics(keywords: string[]) {
     if (!process.env.SEMRUSH_API_KEY || keywords.length === 0) {
      console.warn('SEMrush integration not configured or keywords are missing');
      return null;
    }
    // Implement SEMrush API calls using fetch
    const response = await fetch(
      `https://api.semrush.com/analytics/v1/?type=phrase_this&key=${process.env.SEMRUSH_API_KEY}&phrase=${keywords.join(',')}&database=us`
    );
     if (!response.ok) {
       console.error('Error fetching SEMrush keyword metrics:', response.statusText);
       return null;
     }
    return response.json();
  }
}

// Create instances of custom clients (made optional)
const facebookClient = new CustomFacebookClient();
const clickupClient = new CustomClickUpClient();
const teachableClient = new CustomTeachableClient();
const semrushClient = new CustomSemrushClient();

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

  // Data Fetching
  fetchPlatformData(): Promise<PlatformData>;
  normalizeData(data: PlatformData): NormalizedMetrics;
  calculateMetrics(normalizedData: NormalizedMetrics): {
    funnel: FunnelMetrics;
    persona: PersonaMetrics[];
    exitIntent: ExitIntentMetrics;
    emailRecovery: EmailRecoveryMetrics;
    retargeting: RetargetingMetrics;
    leadScoring: LeadScoringMetrics;
    revenue: RevenueMetrics;
    alerts: Alert[];
    keywords: KeywordMetrics[];
    competitors: CompetitorMetrics[];
    optimizationRecommendations: OptimizationRecommendation[];
  };
  analyzeTrends(): Promise<any>;
  checkAlerts(metrics: any): Promise<Alert[]>;
  generateRecommendations(metrics: any): Promise<OptimizationRecommendation[]>;

  // User Behavior Tracking
  trackUserEvent(event: UserEvent): Promise<void>;
  trackUserInteraction(interaction: UserInteraction): Promise<void>;

  // Cache Management
  invalidateCache(key?: string): Promise<void>;
  getCache(key: string): Promise<any | null>;
  setCache(key: string, value: any, ttl?: number): Promise<void>;
}

export class AnalyticsServiceImpl extends BaseService implements AnalyticsService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/analytics') {
    super();
    this.baseUrl = baseUrl;
  }

  async trackPageView(pagePath: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pagePath, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackPageView');
    }
  }

  async trackContentView(contentId: string, path: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, path, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackContentView');
    }
  }

  async trackSearch(query: string, path: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, path, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackSearch');
    }
  }

  async trackDownload(contentId: string, path: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, path, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackDownload');
    }
  }

  async trackInteraction(interactionType: string, path: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: interactionType, path, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackInteraction');
    }
  }

  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      await this.handleError(error, 'trackPerformance');
    }
  }

  async trackContentInteraction(contentId: string, interactionType: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/content-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, type: interactionType, metadata }),
      });
    } catch (error) {
      await this.handleError(error, 'trackContentInteraction');
    }
  }

  async getContentAnalytics(contentId: string): Promise<ContentAnalytics> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/content/${contentId}`);
      return this.validateResponse<ContentAnalytics>(response, 'getContentAnalytics');
    } catch (error) {
      return this.handleError(error, 'getContentAnalytics');
    }
  }

  async getPerformanceMetrics(type?: string, startDate?: Date, endDate?: Date): Promise<PerformanceMetric[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await this.fetchWithTimeout(`${this.baseUrl}/performance?${params.toString()}`);
      return this.validateResponse<PerformanceMetric[]>(response, 'getPerformanceMetrics');
    } catch (error) {
      return this.handleError(error, 'getPerformanceMetrics');
    }
  }

  async getUserEvents(type?: string, startDate?: Date, endDate?: Date): Promise<UserEvent[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await this.fetchWithTimeout(`${this.baseUrl}/events?${params.toString()}`);
      return this.validateResponse<UserEvent[]>(response, 'getUserEvents');
    } catch (error) {
      return this.handleError(error, 'getUserEvents');
    }
  }

  async getFunnelMetrics(startDate?: Date, endDate?: Date): Promise<FunnelMetrics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await this.fetchWithTimeout(`${this.baseUrl}/funnel?${params.toString()}`);
      return this.validateResponse<FunnelMetrics>(response, 'getFunnelMetrics');
    } catch (error) {
      return this.handleError(error, 'getFunnelMetrics');
    }
  }

  async getExitIntentMetrics(startDate?: Date, endDate?: Date): Promise<ExitIntentMetrics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await this.fetchWithTimeout(`${this.baseUrl}/exit-intent?${params.toString()}`);
      return this.validateResponse<ExitIntentMetrics>(response, 'getExitIntentMetrics');
    } catch (error) {
      return this.handleError(error, 'getExitIntentMetrics');
    }
  }

  async getLeadScoringMetrics(): Promise<LeadScoringMetrics> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/lead-scoring`);
      return this.validateResponse<LeadScoringMetrics>(response, 'getLeadScoringMetrics');
    } catch (error) {
      return this.handleError(error, 'getLeadScoringMetrics');
    }
  }

  async getRevenueMetrics(startDate?: Date, endDate?: Date): Promise<RevenueMetrics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await this.fetchWithTimeout(`${this.baseUrl}/revenue?${params.toString()}`);
      return this.validateResponse<RevenueMetrics>(response, 'getRevenueMetrics');
    } catch (error) {
      return this.handleError(error, 'getRevenueMetrics');
    }
  }

  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/alerts`);
      return this.validateResponse<Alert[]>(response, 'getAlerts');
    } catch (error) {
      return this.handleError(error, 'getAlerts');
    }
  }

  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/recommendations`);
      return this.validateResponse<OptimizationRecommendation[]>(response, 'getRecommendations');
    } catch (error) {
      return this.handleError(error, 'getRecommendations');
    }
  }

  async fetchPlatformData(): Promise<PlatformData> {
    try {
      const [ga4Data, facebookData, clickupData, teachableData, semrushData] = await Promise.all([
        ga4.properties.runReport({
          property: `properties/${process.env.GA4_PROPERTY_ID}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'newUsers' },
            { name: 'sessions' },
            { name: 'bounceRate' },
          ],
        }),
        facebookClient.getInsights(),
        clickupClient.getTasks(process.env.CLICKUP_SPACE_ID),
        teachableClient.getCourses(),
        semrushClient.getKeywordMetrics(['amazon seller', 'amazon fba']),
      ]);

      return {
        platform: 'analytics',
        data: {
          ga4: ga4Data,
          facebook: facebookData,
          clickup: clickupData,
          teachable: teachableData,
          semrush: semrushData,
        },
        timestamp: new Date()
      };
    } catch (error) {
      return this.handleError(error, 'fetchPlatformData');
    }
  }

  normalizeData(data: PlatformData): NormalizedMetrics {
    // Implementation of data normalization logic
    return {
      // Normalized metrics implementation
    } as NormalizedMetrics;
  }

  calculateMetrics(normalizedData: NormalizedMetrics): {
    funnel: FunnelMetrics;
    persona: PersonaMetrics[];
    exitIntent: ExitIntentMetrics;
    emailRecovery: EmailRecoveryMetrics;
    retargeting: RetargetingMetrics;
    leadScoring: LeadScoringMetrics;
    revenue: RevenueMetrics;
    alerts: Alert[];
    keywords: KeywordMetrics[];
    competitors: CompetitorMetrics[];
    optimizationRecommendations: OptimizationRecommendation[];
  } {
    return {
      funnel: {
        totalVisitors: 0,
        conversionRate: 0,
        dropOffRate: 0,
        stages: []
      },
      persona: [],
      exitIntent: {
        totalExits: 0,
        recoveryRate: 0,
        averageTimeToExit: 0,
        topExitPages: []
      },
      emailRecovery: {
        totalEmails: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        averageTimeToOpen: 0
      },
      retargeting: {
        totalImpressions: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        costPerAcquisition: 0,
        returnOnAdSpend: 0
      },
      leadScoring: {
        totalLeads: 0,
        averageScore: 0,
        qualificationRate: {
          hot: 0,
          warm: 0,
          cold: 0
        },
        conversionRate: 0
      },
      revenue: {
        totalRevenue: 0,
        averageOrderValue: 0,
        customerLifetimeValue: 0,
        revenueBySource: []
      },
      alerts: [],
      keywords: [],
      competitors: [],
      optimizationRecommendations: []
    };
  }

  async analyzeTrends(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/trends`);
      return this.validateResponse(response, 'analyzeTrends');
    } catch (error) {
      return this.handleError(error, 'analyzeTrends');
    }
  }

  async checkAlerts(metrics: any): Promise<Alert[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/alerts/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      return this.validateResponse<Alert[]>(response, 'checkAlerts');
    } catch (error) {
      return this.handleError(error, 'checkAlerts');
    }
  }

  async generateRecommendations(metrics: any): Promise<OptimizationRecommendation[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
      return this.validateResponse<OptimizationRecommendation[]>(response, 'generateRecommendations');
    } catch (error) {
      return this.handleError(error, 'generateRecommendations');
    }
  }

  async trackUserEvent(event: UserEvent): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/user-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      await this.handleError(error, 'trackUserEvent');
    }
  }

  async trackUserInteraction(interaction: UserInteraction): Promise<void> {
    try {
      await this.fetchWithTimeout(`${this.baseUrl}/track/user-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction),
      });
    } catch (error) {
      await this.handleError(error, 'trackUserInteraction');
    }
  }

  async invalidateCache(key?: string): Promise<void> {
    try {
      if (key) {
        await redis.del(`${CACHE_PREFIX}${key}`);
      } else {
        const keys = await redis.keys(`${CACHE_PREFIX}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (error) {
      await this.handleError(error, 'invalidateCache');
    }
  }

  async getCache(key: string): Promise<any | null> {
    try {
      const data = await redis.get(`${CACHE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      await this.handleError(error, 'getCache');
      return null;
    }
  }

  async setCache(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
    try {
      await redis.setex(`${CACHE_PREFIX}${key}`, ttl, JSON.stringify(value));
    } catch (error) {
      await this.handleError(error, 'setCache');
    }
  }
}

export const analyticsService = new AnalyticsServiceImpl(); 