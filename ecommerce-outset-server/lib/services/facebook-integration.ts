import { BaseService } from './BaseService';
import { redis } from '@/lib/redis';
import {
  FacebookGroupPost,
  GroupContent,
  GroupMember,
  GroupIntegrationConfig,
  GroupAnalytics,
  GroupEvent,
  GroupResource,
  GroupIntegrationMetrics
} from '@/types/facebook-integration';

const CACHE_TTL = 3600; // 1 hour

export class FacebookIntegrationService extends BaseService {
  private config: GroupIntegrationConfig;
  private readonly GROUP_ID: string;
  private readonly API_VERSION = 'v18.0';
  private readonly BASE_URL: string;

  constructor(config: GroupIntegrationConfig) {
    super();
    this.config = config;
    this.GROUP_ID = config.groupId || 'ecommerceoutset';
    this.BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;
  }

  // Helper function to fetch data from Facebook Graph API
  private async fetchFromGraphAPI(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = `${this.BASE_URL}/${endpoint}`;
    const queryParams = new URLSearchParams({
      access_token: this.config.accessToken,
      ...params,
    }).toString();

    try {
      const response = await this.fetchWithTimeout(`${url}?${queryParams}`);
      return this.validateResponse(response, 'Facebook Graph API');
    } catch (error) {
      return this.handleError(error, 'Facebook Graph API');
    }
  }

  // Group Posts and Content
  async getLatestPosts(limit: number = 10): Promise<FacebookGroupPost[]> {
    const cacheKey = `group:posts:latest:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      fields: 'id,message,created_time,from,likes.summary(true),comments.summary(true),shares',
      limit: limit.toString()
    });

    const posts = response.data.map(this.formatGroupPost);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(posts));
    return posts;
  }

  async getFeaturedDiscussions(personaType: string): Promise<GroupContent[]> {
    const cacheKey = `group:discussions:featured:${personaType}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      fields: 'id,message,created_time,from,likes.summary(true),comments.summary(true)',
      limit: '20'
    });

    const discussions = response.data
      .filter(post => post.message?.includes(`#${personaType}`))
      .map(this.formatGroupContent);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(discussions));
    return discussions;
  }

  // Member Management
  async getGroupStats(): Promise<GroupAnalytics> {
    const cacheKey = 'group:stats';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const [memberCount, activeMembers, posts] = await Promise.all([
      this.getMemberCount(),
      this.getActiveMembers(),
      this.getPostsLast24h()
    ]);

    const stats = {
      memberGrowth: {
        total: memberCount,
        newThisMonth: await this.getNewMembersThisMonth(),
        activeThisMonth: activeMembers
      },
      engagement: {
        postsPerDay: posts,
        commentsPerDay: await this.getCommentsLast24h(),
        averageEngagementRate: await this.calculateEngagementRate()
      },
      contentPerformance: {
        topPosts: await this.getTopPosts(),
        topDiscussions: await this.getTopDiscussions(),
        popularTags: await this.getPopularTags()
      },
      conversionMetrics: await this.getConversionMetrics()
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
    return stats;
  }

  // Content Syndication
  async shareWebsiteContent(content: GroupContent): Promise<void> {
    if (!this.config.autoPostEnabled) return;

    const message = this.formatContentForGroup(content);
    await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      message,
      link: content.url
    });
  }

  // Event Management
  async getUpcomingEvents(): Promise<GroupEvent[]> {
    const cacheKey = 'group:events:upcoming';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/events`, {
      fields: 'id,name,description,start_time,end_time,attending_count',
      limit: '10'
    });

    const events = response.data.map(this.formatGroupEvent);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(events));
    return events;
  }

  // Analytics and Metrics
  async getIntegrationMetrics(): Promise<GroupIntegrationMetrics> {
    const cacheKey = 'group:metrics:integration';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const metrics = {
      websiteVisits: await this.getWebsiteVisitMetrics(),
      contentEngagement: await this.getContentEngagementMetrics(),
      memberActivity: await this.getMemberActivityMetrics(),
      serviceConversions: await this.getServiceConversionMetrics()
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(metrics));
    return metrics;
  }

  // Helper Methods
  private formatGroupPost(post: any): FacebookGroupPost {
    return {
      id: post.id,
      message: post.message,
      created_time: post.created_time,
      from: {
        name: post.from.name,
        id: post.from.id
      },
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      permalink_url: `https://facebook.com/${post.id}`
    };
  }

  private formatGroupContent(post: any): GroupContent {
    return {
      id: post.id,
      type: 'post',
      title: post.message?.split('\n')[0] || 'Untitled',
      content: post.message,
      author: post.from.name,
      createdAt: post.created_time,
      tags: this.extractTags(post.message),
      engagement: {
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: 0
      },
      personaTags: this.extractPersonaTags(post.message)
    };
  }

  private formatGroupEvent(event: any): GroupEvent {
    return {
      id: event.id,
      title: event.name,
      description: event.description,
      startTime: event.start_time,
      endTime: event.end_time,
      type: this.determineEventType(event.description),
      groupUrl: `https://facebook.com/events/${event.id}`,
      attendees: event.attending_count
    };
  }

  private extractTags(message: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    return (message.match(hashtagRegex) || []).map(tag => tag.slice(1));
  }

  private extractPersonaTags(message: string): string[] {
    const personaTags = ['StartupSam', 'ScalingSarah', 'LearningLarry', 'InvestorIan', 'ProviderPriya'];
    return this.extractTags(message).filter(tag => personaTags.includes(tag));
  }

  private determineEventType(description: string): GroupEvent['type'] {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('webinar')) return 'webinar';
    if (lowerDesc.includes('live')) return 'live';
    if (lowerDesc.includes('workshop')) return 'workshop';
    return 'q&a';
  }

  private formatContentForGroup(content: GroupContent): string {
    return `${content.title}\n\n${content.description}\n\n#${content.personaTags.join(' #')}`;
  }

  // Private API Methods
  private async getMemberCount(): Promise<number> {
    const response = await this.fetchFromGraphAPI(this.GROUP_ID, {
      fields: 'member_count'
    });
    return response.member_count;
  }

  private async getActiveMembers(): Promise<number> {
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/members`, {
      fields: 'id',
      limit: '1'
    });
    return response.summary.total_count;
  }

  private async getPostsLast24h(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      fields: 'id',
      since: yesterday.toISOString(),
      limit: '1'
    });
    return response.summary.total_count;
  }

  private async getNewMembersThisMonth(): Promise<number> {
    const firstDay = new Date();
    firstDay.setDate(1);
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/members`, {
      fields: 'id',
      since: firstDay.toISOString(),
      limit: '1'
    });
    return response.summary.total_count;
  }

  private async getCommentsLast24h(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/comments`, {
      fields: 'id',
      since: yesterday.toISOString(),
      limit: '1'
    });
    return response.summary.total_count;
  }

  private async calculateEngagementRate(): Promise<number> {
    const [posts, comments, members] = await Promise.all([
      this.getPostsLast24h(),
      this.getCommentsLast24h(),
      this.getMemberCount()
    ]);
    return ((posts + comments) / members) * 100;
  }

  private async getTopPosts(): Promise<FacebookGroupPost[]> {
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      fields: 'id,message,created_time,from,likes.summary(true),comments.summary(true),shares',
      limit: '5',
      order: 'engagement'
    });
    return response.data.map(this.formatGroupPost);
  }

  private async getTopDiscussions(): Promise<GroupContent[]> {
    const response = await this.fetchFromGraphAPI(`${this.GROUP_ID}/feed`, {
      fields: 'id,message,created_time,from,likes.summary(true),comments.summary(true)',
      limit: '5',
      order: 'comments'
    });
    return response.data.map(this.formatGroupContent);
  }

  private async getPopularTags(): Promise<string[]> {
    const posts = await this.getLatestPosts(50);
    const tags = posts.flatMap(post => this.extractTags(post.message));
    const tagCounts = tags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private async getConversionMetrics(): Promise<GroupAnalytics['conversionMetrics']> {
    // This would typically come from your analytics service
    return {
      groupToWebsite: 0,
      groupToService: 0,
      groupToEvent: 0
    };
  }

  private async getWebsiteVisitMetrics(): Promise<GroupIntegrationMetrics['websiteVisits']> {
    // This would typically come from your analytics service
    return {
      total: 0,
      unique: 0,
      conversionRate: 0
    };
  }

  private async getContentEngagementMetrics(): Promise<GroupIntegrationMetrics['contentEngagement']> {
    // This would typically come from your analytics service
    return {
      views: 0,
      shares: 0,
      comments: 0
    };
  }

  private async getMemberActivityMetrics(): Promise<GroupIntegrationMetrics['memberActivity']> {
    const [activeMembers, newMembers] = await Promise.all([
      this.getActiveMembers(),
      this.getNewMembersThisMonth()
    ]);
    return {
      activeMembers,
      newMembers,
      engagementScore: await this.calculateEngagementRate()
    };
  }

  private async getServiceConversionMetrics(): Promise<GroupIntegrationMetrics['serviceConversions']> {
    // This would typically come from your analytics service
    return {
      leads: 0,
      enrollments: 0,
      revenue: 0
    };
  }
} 