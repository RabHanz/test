import { prisma } from '../utils/api';
import { Redis } from 'ioredis';
import {
  UserContext,
  PersonalizationRule,
  RuleCondition,
  RuleAction,
  PersonalizationResult,
  ContentRecommendation,
  ServiceRecommendation,
  PersonalizationMetrics,
} from '../types/personalization';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Cache configuration
const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'personalization:';

export class PersonalizationService {
  // Rule Management
  async getRules(): Promise<PersonalizationRule[]> {
    const cacheKey = `${CACHE_PREFIX}rules`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const rules = await prisma.personalizationRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    await redis.set(cacheKey, JSON.stringify(rules), 'EX', CACHE_TTL);
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
      if (this.evaluateConditions(rule.conditions, context)) {
        actions.push(...rule.actions);
      }
    }

    return {
      actions,
      context,
      timestamp: new Date(),
    };
  }

  private evaluateConditions(conditions: RuleCondition[], context: UserContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(condition: RuleCondition, context: UserContext): boolean {
    const value = this.getContextValue(condition.type, context);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return Array.isArray(value) && value.includes(condition.value);
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      default:
        return false;
    }
  }

  private getContextValue(type: string, context: UserContext): any {
    switch (type) {
      case 'persona':
        return context.persona;
      case 'engagement':
        return context.engagementLevel;
      case 'device':
        return context.deviceType;
      case 'visitor':
        return context.visitorType;
      case 'content':
        return context.contentInteractions;
      case 'service':
        return context.serviceInteractions;
      case 'quiz':
        return context.quizResults;
      default:
        return null;
    }
  }

  // Content Recommendations
  async getContentRecommendations(context: UserContext): Promise<ContentRecommendation[]> {
    const cacheKey = `${CACHE_PREFIX}content:${context.persona}:${context.engagementLevel}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const recommendations = await this.generateContentRecommendations(context);
    await redis.set(cacheKey, JSON.stringify(recommendations), 'EX', CACHE_TTL);
    
    return recommendations;
  }

  private async generateContentRecommendations(context: UserContext): Promise<ContentRecommendation[]> {
    // Implement content recommendation logic based on persona, engagement, and interactions
    const recommendations: ContentRecommendation[] = [];

    // Example: Recommend Launch Program content for Startup Sam with high engagement
    if (context.persona === 'startup_sam' && context.engagementLevel === 'high') {
      recommendations.push({
        contentId: 'launch-program',
        title: 'Launch Program Overview',
        type: 'service',
        relevance: 0.9,
        reason: 'High engagement with startup content',
      });
    }

    return recommendations;
  }

  // Service Recommendations
  async getServiceRecommendations(context: UserContext): Promise<ServiceRecommendation[]> {
    const cacheKey = `${CACHE_PREFIX}service:${context.persona}:${context.engagementLevel}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const recommendations = await this.generateServiceRecommendations(context);
    await redis.set(cacheKey, JSON.stringify(recommendations), 'EX', CACHE_TTL);
    
    return recommendations;
  }

  private async generateServiceRecommendations(context: UserContext): Promise<ServiceRecommendation[]> {
    // Implement service recommendation logic based on persona, engagement, and interactions
    const recommendations: ServiceRecommendation[] = [];

    // Example: Recommend Scale Program for Scaling Sarah with pricing page visits
    if (context.persona === 'scaling_sarah' && 
        context.contentInteractions.some(i => i.contentId === 'pricing')) {
      recommendations.push({
        serviceId: 'scale-program',
        name: 'Scale Program',
        tier: 'premium',
        relevance: 0.85,
        reason: 'Interest in scaling services',
      });
    }

    return recommendations;
  }

  // Metrics
  async getMetrics(): Promise<PersonalizationMetrics> {
    const cacheKey = `${CACHE_PREFIX}metrics`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const metrics = await this.calculateMetrics();
    await redis.set(cacheKey, JSON.stringify(metrics), 'EX', CACHE_TTL);
    
    return metrics;
  }

  private async calculateMetrics(): Promise<PersonalizationMetrics> {
    // Implement metrics calculation logic
    return {
      ruleEvaluations: 0,
      actionsTriggered: 0,
      contentRecommendations: 0,
      serviceRecommendations: 0,
      conversionLift: 0,
      engagementLift: 0,
    };
  }

  // Cache Management
  private async invalidateRulesCache(): Promise<void> {
    await redis.del(`${CACHE_PREFIX}rules`);
  }

  // New methods to fix linter errors
  async getRecommendations(context: UserContext): Promise<{ content: ContentRecommendation[]; service: ServiceRecommendation[] }> {
    const [content, service] = await Promise.all([
      this.getContentRecommendations(context),
      this.getServiceRecommendations(context)
    ]);
    return { content, service };
  }

  async trackInteraction(context: UserContext, interactionType: string, metadata?: Record<string, any>): Promise<void> {
    // Implement tracking logic here
    console.log('Tracking interaction:', { context, interactionType, metadata });
  }
} 