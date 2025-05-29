export interface FacebookGroupPost {
  id: string;
  message: string;
  created_time: string;
  from: {
    name: string;
    id: string;
  };
  likes: number;
  comments: number;
  shares: number;
  permalink_url: string;
}

export interface FacebookGroupStats {
  memberCount: number;
  activeMembers: number;
  postsLast24h: number;
  engagementRate: number;
}

export interface GroupContent {
  id: string;
  type: 'post' | 'discussion' | 'event' | 'resource';
  title: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  personaTags: string[];
}

export interface GroupMember {
  id: string;
  name: string;
  joinDate: string;
  engagementScore: number;
  personaType?: string;
  websiteProfile?: {
    id: string;
    email: string;
    services: string[];
  };
}

export interface GroupIntegrationConfig {
  groupId: string;
  accessToken: string;
  autoPostEnabled: boolean;
  contentSyncEnabled: boolean;
  memberTrackingEnabled: boolean;
  moderationEnabled: boolean;
}

export interface GroupAnalytics {
  memberGrowth: {
    total: number;
    newThisMonth: number;
    activeThisMonth: number;
  };
  engagement: {
    postsPerDay: number;
    commentsPerDay: number;
    averageEngagementRate: number;
  };
  contentPerformance: {
    topPosts: FacebookGroupPost[];
    topDiscussions: GroupContent[];
    popularTags: string[];
  };
  conversionMetrics: {
    groupToWebsite: number;
    groupToService: number;
    groupToEvent: number;
  };
}

export interface GroupModerationAction {
  type: 'flag' | 'approve' | 'delete' | 'pin';
  postId: string;
  reason?: string;
  moderator: string;
  timestamp: string;
}

export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'webinar' | 'live' | 'workshop' | 'q&a';
  registrationUrl?: string;
  groupUrl: string;
  attendees: number;
  maxAttendees?: number;
}

export interface GroupResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'tool' | 'case-study';
  url: string;
  personaTags: string[];
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupIntegrationMetrics {
  websiteVisits: {
    total: number;
    unique: number;
    conversionRate: number;
  };
  contentEngagement: {
    views: number;
    shares: number;
    comments: number;
  };
  memberActivity: {
    activeMembers: number;
    newMembers: number;
    engagementScore: number;
  };
  serviceConversions: {
    leads: number;
    enrollments: number;
    revenue: number;
  };
} 