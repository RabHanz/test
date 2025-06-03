import { NextRequest } from 'next/server';
import { GET as getContentAnalytics, POST as postContentAnalytics } from '../content/route';
import { GET as getPerformanceMetrics, POST as postPerformanceMetrics } from '../performance/route';
import { GET as getUserInteractions, POST as postUserInteractions } from '../interactions/route';
import { POST as trackEvent } from '../track/route';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
  },
}));

describe('Analytics API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Analytics', () => {
    it('should return content analytics data', async () => {
      const mockData = [
        {
          id: '1',
          contentId: 'content-1',
          type: 'view',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(mockData);

      const request = new NextRequest('http://localhost:3000/api/analytics/content?contentId=content-1');
      const response = await getContentAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });

    it('should track content analytics event', async () => {
      const mockData = {
        id: '1',
        contentId: 'content-1',
        type: 'view',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([mockData]);

      const request = new NextRequest('http://localhost:3000/api/analytics/content', {
        method: 'POST',
        body: JSON.stringify({
          contentId: 'content-1',
          type: 'view',
          metadata: {},
        }),
      });

      const response = await postContentAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });
  });

  describe('Performance Metrics', () => {
    it('should return performance metrics data', async () => {
      const mockData = [
        {
          id: '1',
          type: 'page_load',
          value: 1000,
          metadata: {},
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(mockData);

      const request = new NextRequest('http://localhost:3000/api/analytics/performance?type=page_load');
      const response = await getPerformanceMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });

    it('should track performance metric', async () => {
      const mockData = {
        id: '1',
        type: 'page_load',
        value: 1000,
        metadata: {},
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([mockData]);

      const request = new NextRequest('http://localhost:3000/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify({
          type: 'page_load',
          value: 1000,
          metadata: {},
        }),
      });

      const response = await postPerformanceMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });
  });

  describe('User Interactions', () => {
    it('should return user interactions data', async () => {
      const mockData = [
        {
          id: '1',
          type: 'click',
          userId: 'user-1',
          contentId: 'content-1',
          metadata: {},
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(mockData);

      const request = new NextRequest('http://localhost:3000/api/analytics/interactions?userId=user-1');
      const response = await getUserInteractions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });

    it('should track user interaction', async () => {
      const mockData = {
        id: '1',
        type: 'click',
        userId: 'user-1',
        contentId: 'content-1',
        metadata: {},
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([mockData]);

      const request = new NextRequest('http://localhost:3000/api/analytics/interactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'click',
          userId: 'user-1',
          contentId: 'content-1',
          metadata: {},
        }),
      });

      const response = await postUserInteractions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });
  });

  describe('Event Tracking', () => {
    it('should track event', async () => {
      const mockData = {
        id: '1',
        type: 'custom_event',
        userId: 'user-1',
        metadata: {},
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce([mockData]);

      const request = new NextRequest('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          type: 'custom_event',
          userId: 'user-1',
          metadata: {},
        }),
      });

      const response = await trackEvent(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
    });
  });
}); 