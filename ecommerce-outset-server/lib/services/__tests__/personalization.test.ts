import { PersonalizationService } from '../personalization';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { UserContext, PersonalizationRule, RuleCondition, RuleAction } from '@/types/personalization';

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
    personalizationRule: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    content: {
      findMany: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
    },
    personalizationEvent: {
      create: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PersonalizationService', () => {
  let service: PersonalizationService;
  const mockUserContext: UserContext = {
    userId: 'user-1',
    persona: 'StartupSam',
    engagementLevel: 'medium',
    visitorType: 'returning',
    interactionCount: 15,
    lastVisit: new Date(),
    interests: ['ecommerce', 'automation'],
  };

  beforeEach(() => {
    service = new PersonalizationService();
    jest.clearAllMocks();
  });

  describe('getRules', () => {
    it('should return cached rules if available', async () => {
      const mockRules = [{ id: '1', name: 'Test Rule' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRules));

      const result = await service.getRules();

      expect(result).toEqual(mockRules);
      expect(redis.get).toHaveBeenCalledWith('personalization:rules');
      expect(prisma.personalizationRule.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and cache rules if not in cache', async () => {
      const mockRules = [{ id: '1', name: 'Test Rule' }];
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.personalizationRule.findMany as jest.Mock).mockResolvedValue(mockRules);

      const result = await service.getRules();

      expect(result).toEqual(mockRules);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('createRule', () => {
    it('should create a new rule and invalidate cache', async () => {
      const mockRule: Omit<PersonalizationRule, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Rule',
        condition: { type: 'engagement_level', value: 'high' },
        action: { type: 'recommend_content', contentId: '1' },
        priority: 1,
        isActive: true,
      };

      const createdRule = { ...mockRule, id: '1', createdAt: new Date(), updatedAt: new Date() };
      (prisma.personalizationRule.create as jest.Mock).mockResolvedValue(createdRule);

      const result = await service.createRule(mockRule);

      expect(result).toEqual(createdRule);
      expect(redis.del).toHaveBeenCalledWith('personalization:rules');
    });
  });

  describe('evaluateRules', () => {
    it('should evaluate rules and return recommendations', async () => {
      const mockRules: PersonalizationRule[] = [{
        id: '1',
        name: 'Test Rule',
        condition: { type: 'engagement_level', value: 'medium' },
        action: { type: 'recommend_content', contentId: '1' },
        priority: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

      const mockContent = [{
        id: '1',
        title: 'Test Content',
        type: 'article',
        url: '/content/1',
      }];

      const mockServices = [{
        id: '1',
        name: 'Test Service',
        description: 'Test Description',
        url: '/services/1',
      }];

      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRules));
      (prisma.content.findMany as jest.Mock).mockResolvedValue(mockContent);
      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

      const result = await service.evaluateRules(mockUserContext);

      expect(result.actions).toHaveLength(1);
      expect(result.recommendations.content).toHaveLength(1);
      expect(result.recommendations.service).toHaveLength(1);
    });
  });

  describe('getContentRecommendations', () => {
    it('should return cached recommendations if available', async () => {
      const mockRecommendations = [{ id: '1', title: 'Test Content' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRecommendations));

      const result = await service.getContentRecommendations(mockUserContext);

      expect(result).toEqual(mockRecommendations);
      expect(redis.get).toHaveBeenCalledWith('personalization:content:StartupSam:medium');
      expect(prisma.content.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and cache recommendations if not in cache', async () => {
      const mockContent = [{
        id: '1',
        title: 'Test Content',
        type: 'article',
        url: '/content/1',
      }];

      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.content.findMany as jest.Mock).mockResolvedValue(mockContent);

      const result = await service.getContentRecommendations(mockUserContext);

      expect(result).toHaveLength(1);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('getServiceRecommendations', () => {
    it('should return cached recommendations if available', async () => {
      const mockRecommendations = [{ id: '1', name: 'Test Service' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRecommendations));

      const result = await service.getServiceRecommendations(mockUserContext);

      expect(result).toEqual(mockRecommendations);
      expect(redis.get).toHaveBeenCalledWith('personalization:service:StartupSam:medium');
      expect(prisma.service.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and cache recommendations if not in cache', async () => {
      const mockServices = [{
        id: '1',
        name: 'Test Service',
        description: 'Test Description',
        url: '/services/1',
      }];

      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);

      const result = await service.getServiceRecommendations(mockUserContext);

      expect(result).toHaveLength(1);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('getMetrics', () => {
    it('should return cached metrics if available', async () => {
      const mockMetrics = {
        totalEvaluations: 100,
        cacheHits: 50,
        cacheMisses: 50,
        ruleMatches: 75,
        actionTriggers: 100,
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockMetrics));

      const result = await service.getMetrics();

      expect(result).toEqual(mockMetrics);
      expect(redis.get).toHaveBeenCalledWith('personalization:metrics');
      expect(prisma.personalizationEvent.count).not.toHaveBeenCalled();
    });

    it('should calculate and cache metrics if not in cache', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.personalizationEvent.count as jest.Mock)
        .mockResolvedValueOnce(100) // totalEvaluations
        .mockResolvedValueOnce(50)  // cacheHits
        .mockResolvedValueOnce(75)  // ruleMatches
        .mockResolvedValueOnce(100); // actionTriggers

      const result = await service.getMetrics();

      expect(result).toHaveProperty('totalEvaluations', 100);
      expect(result).toHaveProperty('cacheHits', 50);
      expect(result).toHaveProperty('cacheMisses', 50);
      expect(redis.setex).toHaveBeenCalled();
    });
  });

  describe('trackInteraction', () => {
    it('should create an event and update user context', async () => {
      const mockUser = {
        id: 'user-1',
        interactions: [{ id: '1' }],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, lastInteraction: new Date() });

      await service.trackInteraction(mockUserContext, 'view_content', { contentId: '1' });

      expect(prisma.personalizationEvent.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.personalizationRule.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(service.getRules()).rejects.toThrow('Database error');
    });

    it('should handle cache errors gracefully', async () => {
      (redis.get as jest.Mock).mockRejectedValue(new Error('Cache error'));

      await expect(service.getRules()).rejects.toThrow('Cache error');
    });
  });
}); 