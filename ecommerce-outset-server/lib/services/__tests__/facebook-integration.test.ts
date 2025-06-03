import { FacebookIntegrationService } from '../facebook-integration';
import { redis } from '@/lib/redis';
import { GroupIntegrationConfig } from '@/types/facebook-integration';

// Mock redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('FacebookIntegrationService', () => {
  let service: FacebookIntegrationService;
  const mockConfig: GroupIntegrationConfig = {
    accessToken: 'test-token',
    autoPostEnabled: true,
    groupId: 'test-group',
  };

  beforeEach(() => {
    service = new FacebookIntegrationService(mockConfig);
    jest.clearAllMocks();
  });

  describe('getLatestPosts', () => {
    it('should return cached posts if available', async () => {
      const mockPosts = [{ id: '1', message: 'Test post' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPosts));

      const result = await service.getLatestPosts();

      expect(result).toEqual(mockPosts);
      expect(redis.get).toHaveBeenCalledWith('group:posts:latest:10');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache posts if not in cache', async () => {
      const mockResponse = {
        data: [{ id: '1', message: 'Test post' }],
      };
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getLatestPosts();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', '1');
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('getFeaturedDiscussions', () => {
    it('should return cached discussions if available', async () => {
      const mockDiscussions = [{ id: '1', title: 'Test discussion' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockDiscussions));

      const result = await service.getFeaturedDiscussions('StartupSam');

      expect(result).toEqual(mockDiscussions);
      expect(redis.get).toHaveBeenCalledWith('group:discussions:featured:StartupSam');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache discussions if not in cache', async () => {
      const mockResponse = {
        data: [{ id: '1', message: '#StartupSam Test discussion' }],
      };
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getFeaturedDiscussions('StartupSam');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('title', 'Test discussion');
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('getGroupStats', () => {
    it('should return cached stats if available', async () => {
      const mockStats = {
        memberGrowth: { total: 100 },
        engagement: { postsPerDay: 10 },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockStats));

      const result = await service.getGroupStats();

      expect(result).toEqual(mockStats);
      expect(redis.get).toHaveBeenCalledWith('group:stats');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache stats if not in cache', async () => {
      const mockResponses = {
        memberCount: { member_count: 100 },
        activeMembers: { summary: { total_count: 50 } },
        posts: { summary: { total_count: 10 } },
      };
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.memberCount),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.activeMembers),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses.posts),
        });

      const result = await service.getGroupStats();

      expect(result).toHaveProperty('memberGrowth');
      expect(result).toHaveProperty('engagement');
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('shareWebsiteContent', () => {
    it('should not post if autoPostEnabled is false', async () => {
      const service = new FacebookIntegrationService({
        ...mockConfig,
        autoPostEnabled: false,
      });

      await service.shareWebsiteContent({
        id: '1',
        type: 'post',
        title: 'Test',
        content: 'Test content',
        author: 'Test Author',
        createdAt: new Date().toISOString(),
        tags: [],
        engagement: { likes: 0, comments: 0, shares: 0 },
        personaTags: [],
      });

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should post content if autoPostEnabled is true', async () => {
      const content = {
        id: '1',
        type: 'post' as const,
        title: 'Test',
        content: 'Test content',
        author: 'Test Author',
        createdAt: new Date().toISOString(),
        tags: [],
        engagement: { likes: 0, comments: 0, shares: 0 },
        personaTags: ['StartupSam'],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      });

      await service.shareWebsiteContent(content);

      expect(fetch).toHaveBeenCalled();
      expect(redis.setex).not.toHaveBeenCalled();
    });
  });

  describe('getUpcomingEvents', () => {
    it('should return cached events if available', async () => {
      const mockEvents = [{ id: '1', title: 'Test event' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockEvents));

      const result = await service.getUpcomingEvents();

      expect(result).toEqual(mockEvents);
      expect(redis.get).toHaveBeenCalledWith('group:events:upcoming');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache events if not in cache', async () => {
      const mockResponse = {
        data: [{
          id: '1',
          name: 'Test event',
          description: 'Test description',
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-01-01T01:00:00Z',
          attending_count: 10,
        }],
      };
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.getUpcomingEvents();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('title', 'Test event');
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('getIntegrationMetrics', () => {
    it('should return cached metrics if available', async () => {
      const mockMetrics = {
        websiteVisits: { total: 100 },
        contentEngagement: { views: 50 },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockMetrics));

      const result = await service.getIntegrationMetrics();

      expect(result).toEqual(mockMetrics);
      expect(redis.get).toHaveBeenCalledWith('group:metrics:integration');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache metrics if not in cache', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const result = await service.getIntegrationMetrics();

      expect(result).toHaveProperty('websiteVisits');
      expect(result).toHaveProperty('contentEngagement');
      expect(result).toHaveProperty('memberActivity');
      expect(result).toHaveProperty('serviceConversions');
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(service.getLatestPosts()).rejects.toThrow('Facebook Graph API');
    });

    it('should handle network errors gracefully', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.getLatestPosts()).rejects.toThrow('Network error');
    });
  });
}); 