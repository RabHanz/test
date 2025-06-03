import { BaseService } from './BaseService';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import {
  UserContext,
  PersonalizationRule,
  RuleCondition,
  RuleAction,
  PersonalizationResult,
  ContentRecommendation,
  ServiceRecommendation,
  PersonalizationMetrics,
} from '@/types/personalization';

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'personalization:';

export class PersonalizationService extends BaseService {
  // Rule Management
  async getRules(): Promise<PersonalizationRule[]> {
    const cacheKey = `${CACHE_PREFIX}rules`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const rules = await prisma.personalizationRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(rules));
    return rules;
  }

  async createRule(rule: Omit<PersonalizationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalizationRule> {
    const newRule = await prisma.personalizationRule.create({
      data: {
        ...rule,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.invalidateRulesCache();
    return newRule;
  }

  async updateRule(id: string, rule: Partial<PersonalizationRule>): Promise<PersonalizationRule> {
    const updatedRule = await prisma.personalizationRule.update({
      where: { id },
      data: {
        ...rule,
        updatedAt: new Date(),
      },
    });

    await this.invalidateRulesCache();
    return updatedRule;
  }

  async deleteRule(id: string): Promise<void> {
    await prisma.personalizationRule.delete({
      where: { id },
    });

    await this.invalidateRulesCache();
  }

  // Rule Evaluation
  async evaluateRules(context: UserContext): Promise<PersonalizationResult> {
    const rules = await this.getRules();
    const actions: RuleAction[] = [];

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, context)) {
        actions.push(rule.action);
      }
    }

    const [contentRecommendations, serviceRecommendations] = await Promise.all([
      this.getContentRecommendations(context),
      this.getServiceRecommendations(context)
    ]);

    return {
      actions,
      recommendations: {
        content: contentRecommendations,
        service: serviceRecommendations,
      },
    };
  }

  private evaluateCondition(condition: RuleCondition, context: UserContext): boolean {
    switch (condition.type) {
      case 'engagement_level':
        return context.engagementLevel === condition.value;
      case 'visitor_type':
        return context.visitorType === condition.value;
      case 'persona':
        return context.persona === condition.value;
      case 'interaction_count':
        return context.interactionCount >= condition.value;
      case 'last_visit':
        return this.isWithinTimeframe(context.lastVisit, condition.value);
      default:
        return false;
    }
  }

  private isWithinTimeframe(date: Date, timeframe: string): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    switch (timeframe) {
      case '24h':
        return diff <= 24 * 60 * 60 * 1000;
      case '7d':
        return diff <= 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return diff <= 30 * 24 * 60 * 60 * 1000;
      default:
        return false;
    }
  }

  // Content Recommendations
  async getContentRecommendations(context: UserContext): Promise<ContentRecommendation[]> {
    const cacheKey = `${CACHE_PREFIX}content:${context.persona}:${context.engagementLevel}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const recommendations = await this.generateContentRecommendations(context);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendations));
    
    return recommendations;
  }

  private async generateContentRecommendations(context: UserContext): Promise<ContentRecommendation[]> {
    const content = await prisma.content.findMany({
      where: {
        isPublished: true,
        tags: {
          hasSome: context.interests || [],
        },
      },
      orderBy: {
        engagementScore: 'desc',
      },
      take: 5,
    });

    return content.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      url: `/content/${item.slug}`,
      description: item.description,
      engagementScore: item.engagementScore,
    }));
  }

  // Service Recommendations
  async getServiceRecommendations(context: UserContext): Promise<ServiceRecommendation[]> {
    const cacheKey = `${CACHE_PREFIX}service:${context.persona}:${context.engagementLevel}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const recommendations = await this.generateServiceRecommendations(context);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendations));
    
    return recommendations;
  }

  private async generateServiceRecommendations(context: UserContext): Promise<ServiceRecommendation[]> {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        targetPersonas: {
          hasSome: [context.persona],
        },
      },
      orderBy: {
        conversionRate: 'desc',
      },
      take: 3,
    });

    return services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      url: `/services/${service.slug}`,
      conversionRate: service.conversionRate,
    }));
  }

  // Metrics
  async getMetrics(): Promise<PersonalizationMetrics> {
    const cacheKey = `${CACHE_PREFIX}metrics`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const metrics = await this.calculateMetrics();
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(metrics));
    
    return metrics;
  }

  private async calculateMetrics(): Promise<PersonalizationMetrics> {
    const [
      totalEvaluations,
      cacheHits,
      ruleMatches,
      actionTriggers
    ] = await Promise.all([
      prisma.personalizationEvent.count(),
      prisma.personalizationEvent.count({
        where: { wasCached: true }
      }),
      prisma.personalizationEvent.count({
        where: { ruleMatched: true }
      }),
      prisma.personalizationEvent.count({
        where: { actionTriggered: true }
      })
    ]);

    return {
      totalEvaluations,
      cacheHits,
      cacheMisses: totalEvaluations - cacheHits,
      ruleMatches,
      actionTriggers,
    };
  }

  // Cache Management
  private async invalidateRulesCache(): Promise<void> {
    await redis.del(`${CACHE_PREFIX}rules`);
  }

  async invalidateAllCache(): Promise<void> {
    const keys = await redis.keys(`${CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Interaction Tracking
  async trackInteraction(context: UserContext, interactionType: string, metadata?: Record<string, any>): Promise<void> {
    await prisma.personalizationEvent.create({
      data: {
        userId: context.userId,
        interactionType,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });

    // Update user context if needed
    await this.updateUserContext(context, interactionType);
  }

  private async updateUserContext(context: UserContext, interactionType: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      include: { interactions: true },
    });

    if (user) {
      await prisma.user.update({
        where: { id: context.userId },
        data: {
          lastInteraction: new Date(),
          interactionCount: user.interactions.length + 1,
          engagementLevel: this.calculateEngagementLevel(user.interactions),
        },
      });
    }
  }

  private calculateEngagementLevel(interactions: any[]): string {
    const count = interactions.length;
    if (count > 50) return 'high';
    if (count > 20) return 'medium';
    return 'low';
  }
} 