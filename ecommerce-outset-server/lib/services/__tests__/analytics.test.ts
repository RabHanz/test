import { AnalyticsServiceImpl } from '../analytics';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import {
  UserEvent,
  UserInteraction,
  PerformanceMetric,
  ContentAnalytics,
  FunnelMetrics,
  PersonaMetrics,
  ExitIntentMetrics,
  LeadScoringMetrics,
  RevenueMetrics,
  Alert,
  OptimizationRecommendation,
} from '@/types/analytics';

// Mock redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
    userEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    userInteraction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    performanceMetric: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    contentAnalytics: {
      findUnique: jest.fn(),
    },
    leadCapture: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    alert: {
      findMany: jest.fn(),
    },
    optimizationRecommendation: {
      findMany: jest.fn(),
    },
  },
}));

describe('AnalyticsService', () => {
  let service: AnalyticsServiceImpl;

  beforeEach(() => {
    service = new AnalyticsServiceImpl();
    jest.clearAllMocks();
  });

  describe('Event Tracking', () => {
    it('should track user events', async () => {
      const mockEvent: UserEvent = {
        id: 'event-1',
        type: 'page_view',
        timestamp: new Date(),
        userId: 'user-1',
        metadata: { path: '/home' },
      };

      await service.trackUserEvent(mockEvent);

      expect(prisma.userEvent.create).toHaveBeenCalledWith({
        data: mockEvent,
      });
      expect(redis.del).toHaveBeenCalled();
    });

    it('should track user interactions', async () => {
      const mockInteraction: UserInteraction = {
        id: 'interaction-1',
        type: 'click',
        timestamp: new Date(),
        userId: 'user-1',
        contentId: 'content-1',
        metadata: { element: 'button' },
      };

      await service.trackUserInteraction(mockInteraction);

      expect(prisma.userInteraction.create).toHaveBeenCalledWith({
        data: mockInteraction,
      });
      expect(redis.del).toHaveBeenCalled();
    });

    it('should track performance metrics', async () => {
      const mockMetric: PerformanceMetric = {
        id: 'metric-1',
        type: 'load_time',
        value: 1000,
        timestamp: new Date(),
        metadata: { page: '/home' },
      };

      await service.trackPerformance(mockMetric);

      expect(prisma.performanceMetric.create).toHaveBeenCalledWith({
        data: mockMetric,
      });
      expect(redis.del).toHaveBeenCalled();
    });
  });

  describe('Analytics Retrieval', () => {
    it('should get user events', async () => {
      const mockEvents: UserEvent[] = [
        {
          id: 'event-1',
          type: 'page_view',
          timestamp: new Date(),
          userId: 'user-1',
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.userEvent.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await service.getUserEvents('page_view', new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result).toEqual(mockEvents);
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get performance metrics', async () => {
      const mockMetrics: PerformanceMetric[] = [
        {
          id: 'metric-1',
          type: 'load_time',
          value: 1000,
          timestamp: new Date(),
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.performanceMetric.findMany as jest.Mock).mockResolvedValue(mockMetrics);

      const result = await service.getPerformanceMetrics('load_time', new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result).toEqual(mockMetrics);
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get content analytics', async () => {
      const mockAnalytics: ContentAnalytics = {
        id: 'analytics-1',
        contentId: 'content-1',
        views: 100,
        uniqueViews: 80,
        averageTimeOnPage: 120,
        bounceRate: 0.2,
        conversionRate: 0.1,
      };
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.contentAnalytics.findUnique as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await service.getContentAnalytics('content-1');

      expect(result).toEqual(mockAnalytics);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('Metrics Calculation', () => {
    it('should get funnel metrics', async () => {
      const mockEvents: UserEvent[] = [
        {
          id: 'event-1',
          type: 'page_view',
          timestamp: new Date(),
        },
      ];
      const mockInteractions: UserInteraction[] = [
        {
          id: 'interaction-1',
          type: 'click',
          timestamp: new Date(),
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.userEvent.findMany as jest.Mock).mockResolvedValue(mockEvents);
      (prisma.userInteraction.findMany as jest.Mock).mockResolvedValue(mockInteractions);

      const result = await service.getFunnelMetrics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toBeDefined();
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get exit intent metrics', async () => {
      const mockEvents: UserEvent[] = [
        {
          id: 'event-1',
          type: 'exit_intent',
          timestamp: new Date(),
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.userEvent.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await service.getExitIntentMetrics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toBeDefined();
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get lead scoring metrics', async () => {
      const mockLeads = [
        {
          id: 'lead-1',
          email: 'test@example.com',
          calculatorType: 'basic',
          score: 80,
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.leadCapture.findMany as jest.Mock).mockResolvedValue(mockLeads);

      const result = await service.getLeadScoringMetrics();

      expect(result).toBeDefined();
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get revenue metrics', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          total: 100,
          createdAt: new Date(),
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.getRevenueMetrics(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toBeDefined();
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('Alerts and Recommendations', () => {
    it('should get alerts', async () => {
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          type: 'error',
          message: 'High bounce rate detected',
          severity: 'high',
          timestamp: new Date(),
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.alert.findMany as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await service.getAlerts();

      expect(result).toEqual(mockAlerts);
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should get recommendations', async () => {
      const mockRecommendations: OptimizationRecommendation[] = [
        {
          id: 'rec-1',
          type: 'performance',
          title: 'Optimize Images',
          description: 'Compress images to improve load time',
          impact: 'high',
          effort: 'low',
          priority: 1,
        },
      ];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.optimizationRecommendation.findMany as jest.Mock).mockResolvedValue(mockRecommendations);

      const result = await service.getRecommendations();

      expect(result).toEqual(mockRecommendations);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.userEvent.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(service.getUserEvents()).rejects.toThrow('Database error');
    });

    it('should handle cache errors gracefully', async () => {
      (redis.get as jest.Mock).mockRejectedValue(new Error('Cache error'));

      await expect(service.getUserEvents()).rejects.toThrow('Cache error');
    });

    it('should handle missing content analytics', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.contentAnalytics.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getContentAnalytics('non-existent')).rejects.toThrow(
        'Content analytics not found'
      );
    });
  });
}); 