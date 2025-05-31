export type PersonaType = 'startup_sam' | 'scaling_sarah' | 'learning_larry' | 'investor_ian' | 'provider_priya';

export type EngagementLevel = 'low' | 'medium' | 'high';

export type DeviceType = 'mobile' | 'desktop' | 'tablet';

export type VisitorType = 'new' | 'returning';

export enum InteractionType {
  CONTENT_VIEW = 'CONTENT_VIEW',
  CTA_CLICK = 'CTA_CLICK',
  PRODUCT_RECOMMENDATION_VIEW = 'PRODUCT_RECOMMENDATION_VIEW',
  PRODUCT_CLICK = 'PRODUCT_CLICK',
  UI_PREFERENCE_APPLIED = 'UI_PREFERENCE_APPLIED',
  NOTIFICATION_VIEW = 'NOTIFICATION_VIEW',
  NOTIFICATION_CLICK = 'NOTIFICATION_CLICK',
  NOTIFICATION_ACTION = 'NOTIFICATION_ACTION'
}

export interface UserContext {
  persona?: PersonaType;
  engagementLevel: EngagementLevel;
  deviceType: DeviceType;
  visitorType: VisitorType;
  sessionCount: number;
  lastVisit?: Date;
  contentInteractions: ContentInteraction[];
  serviceInteractions: ServiceInteraction[];
  quizResults?: QuizResults;
}

export interface ContentInteraction {
  contentId: string;
  type: 'view' | 'click' | 'complete' | 'share';
  timestamp: Date;
  duration?: number;
}

export interface ServiceInteraction {
  serviceId: string;
  type: 'view' | 'inquiry' | 'purchase';
  timestamp: Date;
}

export interface QuizResults {
  persona: PersonaType;
  confidence: number;
  answers: Record<string, string>;
  timestamp: Date;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  type: 'persona' | 'engagement' | 'device' | 'visitor' | 'content' | 'service' | 'quiz';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface RuleAction {
  type: 'show_content' | 'hide_content' | 'highlight_service' | 'suggest_content' | 'adapt_ui' | 'trigger_chat';
  value: any;
  metadata?: Record<string, any>;
}

export interface PersonalizationResult {
  actions: RuleAction[];
  context: UserContext;
  timestamp: Date;
}

export interface ContentRecommendation {
  contentId: string;
  title: string;
  type: 'article' | 'video' | 'tool' | 'service';
  relevance: number;
  reason: string;
}

export interface ServiceRecommendation {
  serviceId: string;
  name: string;
  tier: 'basic' | 'premium' | 'enterprise';
  relevance: number;
  reason: string;
}

export interface PersonalizationMetrics {
  ruleEvaluations: number;
  actionsTriggered: number;
  contentRecommendations: number;
  serviceRecommendations: number;
  conversionLift: number;
  engagementLift: number;
} 