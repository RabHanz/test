import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  accentColor?: string;
}

export interface Persona {
  id: PersonaId; // Changed from string to PersonaId
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  memberCount: string;
  ctaText: string;
  ctaHref: string;
  accentColorClass: string; // e.g., 'text-green-400'
  borderColorClass: string; // e.g., 'border-green-400'
  buttonColorClass: string; // e.g., 'bg-green-500 hover:bg-green-600'
  shadowColorClass?: string; // e.g. 'hover:shadow-green-500/30'
  // For Quiz Results Page
  longDescription?: string;
  mascotImage?: string; // URL or path to image
  recommendedResources?: { title: string; type: string; link: string; }[];
  serviceTierPreview?: { name: string; price: string; features: string[]; cta: string; }[];
  strategySessionLink?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  text: string;
  result: string;
  personaId?: PersonaId; // For persona-matched testimonials
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface SocialLink {
  name: string;
  href: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// --- Quiz Specific Types ---

export type PersonaId = 'launch' | 'scale' | 'master' | 'invest' | 'connect' | 'unknown' | 'default_exit';

export interface QuizAnswerOption {
  id: string;
  text: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>; // Optional icon for answers
  scores: Array<{ personaId: PersonaId; points: number }>;
  crmScoreMapping?: { category: keyof DemographicScoreMetrics; points: number }[]; // For CRM lead scoring
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizAnswerOption[];
  skippable?: boolean; // For sensitive questions
  isSensitive?: boolean; // e.g. capital question
}

export interface UserAnswers {
  [questionId: string]: string; // questionId: answerOptionId
}

export interface PersonaScore {
  personaId: PersonaId;
  score: number;
  confidence?: number; // Percentage
}

export interface QuizResult {
  primaryPersona: Persona | null;
  secondaryPersonas: Persona[];
  allScores: PersonaScore[];
}

export interface QuizState {
  currentStep: number; // 0: Welcome, 1-10: Questions, 11: Results
  totalSteps: number;
  email: string;
  hasConsented: boolean;
  answers: UserAnswers;
  scores: Record<PersonaId, number>;
  quizCompleted: boolean;
  isLoading: boolean;
  quizResult: QuizResult | null;

  setEmail: (email: string) => void;
  setHasConsented: (consented: boolean) => void;
  startQuiz: () => void;
  answerQuestion: (questionId: string, answerId: string, questionScores: Array<{ personaId: PersonaId; points: number }>) => void;
  skipQuestion: (questionId: string) => void;
  calculateResults: (personas: Persona[]) => void;
  goToNextStep: () => void;
  resetQuiz: () => void;
  loadState: (persistedState: Partial<QuizState>) => void;
}

// --- Analytics Dashboard Types ---

export type DateRangeOption = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface KpiCardData {
  id: string;
  title: string;
  value: string;
  change?: string; // e.g., "+5.2%"
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  tooltip?: string;
}

export interface ChartDataItem {
  name: string; // Typically date or category
  value: number;
  fill?: string; // For coloring charts e.g. persona breakdown
  [key: string]: any; // For multi-line charts or additional data
}

export interface TrafficSourceDetail {
  name: string;
  value: number; // e.g., visitors or percentage
  details?: string[] | { name: string, value: number }[]; // e.g., top keywords or campaign names
}

export interface TrafficSourcesData {
  organic: TrafficSourceDetail;
  social: TrafficSourceDetail & { breakdown?: TrafficSourceDetail[] }; // e.g., Facebook, Twitter
  direct: TrafficSourceDetail;
  email: TrafficSourceDetail & { campaignPerformance?: { name: string, value: number, metric: string }[] };
  paid: TrafficSourceDetail & { roi?: string };
}

export interface PersonaAnalyticsData {
  distribution: ChartDataItem[]; // Persona name, visitor count
  quizCompletionRates: { source: string, rate: number }[];
  confidenceScores: ChartDataItem[]; // Confidence score bucket, count
}

export interface FunnelStep {
  name: string;
  value: number; // e.g., count or percentage
  dropOff?: number; // Percentage drop-off from previous step
}

export interface ConversionTrackingData {
  funnelVisualization: FunnelStep[];
  quizToEmailRate: number;
  emailToServiceInquiryRate: number;
  serviceInquiryToEnrollmentRate: number;
  revenueAttribution: { byPersona: ChartDataItem[], byChannel: ChartDataItem[] };
}

export interface ShadowFunnelData {
  exitIntentPopup: { views: number, conversions: number, rate: number };
  abandonedQuizRecovery: { recovered: number, rate: number };
  retargetingEffectiveness: ChartDataItem[]; // Campaign name, conversions
  emailSequencePerformance: { sequenceName: string, openRate: number, clickRate: number }[];
}

export interface ContentPerformanceData {
  pageEngagement: { page: string, avgTime: string, persona?: PersonaId }[];
  resourceDownloads: { name: string, downloads: number }[];
  videoCompletion: { video: string, rate: number }[]; // Percentage
  communityMetrics: ChartDataItem[]; // e.g., active users, posts
}

export interface AnalyticsDashboardState {
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  isLoading: boolean;
  overviewData?: {
    realTimeVisitors: number;
    personaBreakdown: ChartDataItem[];
    kpis: KpiCardData[];
    comparison: { metric: string, today: number, yesterday: number }[];
  };
  trafficSourcesData?: TrafficSourcesData;
  personaAnalyticsData?: PersonaAnalyticsData;
  conversionTrackingData?: ConversionTrackingData;
  shadowFunnelData?: ShadowFunnelData;
  contentPerformanceData?: ContentPerformanceData;
  activeTab: string; 

  setDateRange: (range: DateRangeOption) => void;
  setCustomDateRange: (start: string, end: string) => void;
  fetchData: () => Promise<void>; 
  setActiveTab: (tabId: string) => void; 
}

// --- Launch Hub Specific Types ---
export interface RoadmapStep {
  id: string;
  title: string;
  tasks: string[];
}

export interface LaunchTool {
  id: string;
  name: string;
  description: string;
  type: 'Interactive Tool' | 'Downloadable PDF' | 'Spreadsheet' | 'Framework Guide' | 'Downloadable Doc' | 'Guide + Template' | 'PDF Checklist' | 'Tool Preview';
}

export interface LaunchServiceTier {
  id: string;
  name: string;
  price: string;
  description: string;
  roiCalc: string;
  guarantee: string;
}

export interface LaunchCommunityFeature {
  id: string;
  name: string;
  description: string;
}

export interface LaunchSuccessStory {
  id: string;
  name: string;
  before: string;
  after: string;
  result: string;
  videoUrl?: string;
}

export interface LaunchHubState {
  completedRoadmapSteps: Set<string>;
  currentRoadmapStepId: string | null;
  isLaunchAssessmentCompleted: boolean;
  assessmentScore: number | null;
  toolsUsed: Set<string>;
  completeStep: (stepId: string) => void;
  setCurrentStep: (stepId: string | null) => void;
  completeAssessment: (score: number) => void;
  useTool: (toolId: string) => void;
  resetLaunchProgress: () => void;
  _loadState: (persistedState: Partial<LaunchHubState>) => void;
}

// --- Scale Hub Specific Types ---
export interface ScaleHeroStat {
  label: string;
  value: string; // Can be % or other string
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface BusinessDiagnosticTool {
  id: string;
  name: string;
  description: string;
  type: 'Assessment' | 'Matrix' | 'Framework' | 'Analysis Tool' | 'Calculator';
}

export interface OptimizationFramework {
  id: string;
  name: string;
  description: string;
  category: 'Operational Excellence' | 'Revenue Optimization' | 'Scaling Infrastructure';
  type: 'Template' | 'System' | 'SOP' | 'Mechanism' | 'Tool' | 'Framework' | 'Planner' | 'Dashboard' | 'Matrix';
}

export interface ScaleServiceTier {
  id: string;
  name: string;
  price: string;
  description: string;
  timeline: string;
  guarantee?: string;
  features: string[];
}

export interface ScaleCaseStudy {
  id: string;
  clientName: string;
  challenge: string;
  solutionApplied: string;
  results: Array<{ metric: string; value: string; improvement?: string }>;
  testimonialQuote?: string;
}

export interface ScaleInteractiveTool {
  id: string;
  name: string;
  description: string;
  ctaText: string;
}

export interface ScaleMastermindFeature {
  id: string;
  name: string;
  description: string;
}

export interface ScaleHubState {
  businessHealthScore: number | null;
  isDiagnosticCompleted: boolean;
  diagnosticResults: any | null; // Can be more specific
  activeTool: string | null;
  setBusinessHealthScore: (score: number) => void;
  completeDiagnostic: (results: any) => void;
  setActiveTool: (toolId: string | null) => void;
  resetScaleProgress: () => void;
  _loadState: (persistedState: Partial<ScaleHubState>) => void;
}

// --- Master Hub Specific Types ---
export interface MasterHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
}

export interface EcosystemComponentModel {
  id: string;
  name: string;
  description: string;
  detailsLink: string;
}

export interface ConceptualFramework {
  id: string;
  name: string;
  summary: string;
  visualModelUrl?: string;
  applicationScenarios: string[];
}

export interface ImplementationBridge {
  id: string;
  name: string;
  type: 'Exercise' | 'Scenario Module' | 'Decision Framework' | 'Case Analysis' | 'Worksheet';
  description: string;
  durationEstimate: string;
}

export interface KnowledgeDomain {
  id: string;
  name: string;
  description: string;
  assessmentAvailable: boolean;
}

export interface MasteryVerificationMethod {
  id: string;
  name: string;
  type: 'Assessment' | 'Practical Scenario' | 'Peer Teaching' | 'Expert Evaluation' | 'Certification';
  description: string;
}

export interface MasterServiceTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

export interface MasterInteractiveTool {
  id: string;
  name: string;
  description: string;
  toolType: 'Concept Mapper' | 'Simulator' | 'Decision Tree Builder' | 'Framework Worksheet' | 'Knowledge Tester';
}

export interface MasterCommunityFeature {
  id: string;
  name: string;
  description: string;
}

export interface MasterHubState {
  knowledgeAssessmentCompleted: boolean;
  assessmentResults: Record<string, number>; // DomainId: score
  currentLearningPath: string[]; // Array of module IDs or step IDs
  completedModules: Set<string>;
  knowledgeConfidenceScore: number | null;
  completeKnowledgeAssessment: (results: Record<string, number>) => void;
  setKnowledgeConfidence: (score: number) => void;
  completeModule: (moduleId: string) => void;
  resetMasterProgress: () => void;
  _loadState: (persistedState: Partial<MasterHubState>) => void;
}

// --- Invest Hub Specific Types ---
export interface InvestHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
}

export interface DueDiligenceItem {
  id: string;
  name: string;
  description: string;
  category: 'Financial' | 'Operational' | 'Market' | 'Legal';
}

export interface ValuationModel {
  id: string;
  name: string;
  description: string;
  type: 'SDE Multiple' | 'Multi-Factor' | 'DCF Variant' | 'Benchmark';
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'Platform' | 'Market' | 'Operational' | 'Financial' | 'Regulatory';
  mitigationStrategy?: string;
}

export interface PortfolioTool {
  id: string;
  name: string;
  description: string;
  type: 'Planning Tool' | 'Dashboard' | 'Algorithm' | 'Evaluation System';
}

export interface InvestmentOpportunity {
  id: string;
  name: string;
  category: string;
  askingPriceRange: string;
  sdeMultipleRange: string;
  summary: string;
  highlight: string;
}

export interface InvestServiceTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

export interface InvestAnalyticalTool {
  id: string;
  name: string;
  description: string;
  toolType: 'Calculator' | 'Optimizer' | 'Risk Matrix' | 'Checklist' | 'Dashboard';
}

export interface InvestorNetworkFeature {
  id: string;
  name: string;
  description: string;
}

export interface InvestHubState {
  investmentAssessmentCompleted: boolean;
  assessmentResults: any | null; 
  portfolioValue: number | null;
  activeDealId: string | null;
  completeInvestmentAssessment: (results: any) => void;
  setPortfolioValue: (value: number) => void;
  setActiveDeal: (dealId: string | null) => void;
  resetInvestProgress: () => void;
  _loadState: (persistedState: Partial<InvestHubState>) => void;
}

// --- Connect Hub Specific Types ---
export interface ConnectHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
}

export interface ExpertiseFramework {
  id: string;
  name: string;
  description: string;
  type: 'Framework' | 'Template' | 'Tool' | 'System' | 'Strategy';
  category: 'Showcase' | 'Acquisition' | 'Demonstration' | 'Positioning';
}

export interface ClientConnectionOpportunity {
  id: string;
  type: 'Client Matching' | 'Service Request' | 'Collaboration' | 'Network Expansion';
  description: string;
  ctaText: string;
}

export interface ConnectServiceTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

export interface BusinessDevelopmentTool {
  id: string;
  name: string;
  description: string;
  toolType: 'Calculator' | 'Framework' | 'System' | 'Dashboard' | 'Planner';
}

export interface ProviderCommunityFeature {
  id: string;
  name: string;
  description: string;
}

export interface ConnectHubState {
  servicePositioningAssessmentCompleted: boolean;
  assessmentScore: number | null;
  clientQualityScore: number | null; // Example: 0-100
  avgProjectValue: number | null; // Example: 5000
  activeClientOpportunities: string[]; // IDs of opportunities
  completeServicePositioningAssessment: (score: number) => void;
  updateClientQualityScore: (score: number) => void;
  updateAvgProjectValue: (value: number) => void;
  addClientOpportunity: (opportunityId: string) => void;
  resetConnectProgress: () => void;
  _loadState: (persistedState: Partial<ConnectHubState>) => void;
}

// --- Exit Intent & Behavioral Tracking Types ---
export interface PersonaSpecificExitContent {
  headline: string;
  offer: string;
  ctaText: string;
  accentColorClass: string; // e.g., 'border-green-500' or 'bg-green-500'
  imageUrl?: string; // Optional image for the popup
}

export interface ExitIntentPopupProps {
  content: PersonaSpecificExitContent;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

// --- Email Automation & Retargeting System Types ---
export interface EmailStep {
  day?: number; // Day in sequence (e.g., 1, 2, 3) or delay in hours/days from trigger
  subject: string;
  previewText?: string;
  body: string; // Could be plain text or a structured representation for HTML generation
  cta?: { text: string; link: string; };
  segmentationCriteria?: string; // Descriptive: e.g., "IF user_clicked_link_X_in_previous_email"
  personaTarget?: PersonaId[]; // If this step is for specific personas within the sequence
}

export interface EmailSequence {
  id: string; // e.g., 'abandoned_quiz_q2_exit'
  name: string; // e.g., "Abandoned Quiz - Exited After Question 2"
  description: string;
  triggerEvent: string; // e.g., 'quiz_abandoned_at_q2', 'pricing_page_viewed_gt_60s_no_cta'
  audiencePersona?: PersonaId[]; // Default persona(s) for the entire sequence
  steps: EmailStep[];
}

export type BehavioralTrackingEventName =
  | 'pricing_page_abandonment'
  | 'pricing_page_view_extended' // Extended view without CTA click
  | 'pricing_page_cta_click' // Clicked a CTA on pricing page
  | 'pricing_page_view_brief' // Brief view
  | 'tool_usage_abandonment'
  | 'tool_usage_started'
  | 'tool_usage_completed'
  | 'page_abandonment'
  | 'video_view_start'
  | 'video_milestone_25'
  | 'video_milestone_50'
  | 'video_milestone_75'
  | 'video_completed'
  | 'resource_downloaded_with_email'
  | 'resource_downloaded_no_email'
  | 'calendar_page_visit'
  | 'calendar_booking_made' // Added for lead scoring
  | 'multiple_persona_hub_visits'
  | 'low_scroll_depth_bounce'
  | 'ad_blocker_detected' // This is technically challenging and often unreliable
  | 'service_inquiry_started'
  | 'service_inquiry_abandoned_step_X' // X would be a specific step
  | 'service_inquiry_completed'
  | 'quiz_email_submitted'
  | 'quiz_question_answered'
  | 'quiz_question_skipped'
  | 'quiz_completed'
  | 'quiz_reset'
  | 'quiz_abandoned_on_load'
  | 'quiz_exit_intent_detected'
  | 'cta_click'
  | 'navigation_click'
  | 'persona_card_click'
  | 'dashboard_tab_changed'
  | 'dashboard_date_range_changed'
  | 'dashboard_custom_date_range_set'
  | 'dashboard_fetch_data_started'
  | 'dashboard_fetch_data_completed'
  | 'dashboard_export_report_clicked'
  | 'hub_event_launch' // Generic, specific events better
  | 'hub_event_scale'
  | 'hub_event_master'
  | 'hub_event_invest'
  | 'hub_event_connect'
  | 'exit_intent_shown'
  | 'exit_intent_conversion'
  | 'scroll_depth'
  | 'persona_determined'
  | 'engagement_score_changed'
  | 'identified_as_subscriber'
  | 'identified_as_non_subscriber'
  | 'service_inquiry_state_changed'
  | 'multiple_pricing_page_visits_logged' // Internal signal
  | 'email_link_clicked' // Hypothetical, if tracking email clicks that lead to site
  | 'social_media_post_interaction' // Hypothetical, if tracking inbound from social
  | 'community_post_created' // Hypothetical
  | 'community_comment_made'; // Hypothetical


// --- DYNAMIC CONTENT PERSONALIZATION TYPES ---
export type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';
export type ServiceInquiryState = 'none' | 'started' | 'submitted' | 'consult_booked';

export interface InteractionEvent {
  type: BehavioralTrackingEventName | string; // Allow specific or generic event types
  timestamp: number;
  details?: Record<string, any>;
}


// --- CRM & LEAD MANAGEMENT TYPES ---
export interface BehavioralScoreMetrics {
  quizCompletion: number;
  videoEngagement75Plus: number;
  toolUsageCompleted: number;
  multiplePageVisitsHighValue: number; // e.g., multiple hub or service pages
  resourceDownloadedWithEmail: number;
  pricingPageExtendedVisit: number;
  serviceInquiryMade: number;
  calendarBookingMade: number;
  // Add other specific behavioral actions if needed
}

export interface DemographicScoreMetrics {
  personaAlignmentStrong: number; // High confidence in primary persona
  personaAlignmentMedium: number; // Medium confidence or strong secondary
  businessStageAppropriate: number; // Based on quiz (e.g., revenue, status)
  budgetIndicationPositive: number; // Based on quiz (e.g., capital)
  // Add other demographic factors if collected
}

export interface EngagementQualityScoreMetrics {
  emailInteractionPositive: number; // e.g., clicked link in email (hypothetical)
  socialMediaEngagementHigh: number; // e.g., commented on post (hypothetical)
  communityParticipationActive: number; // e.g., multiple posts/comments (hypothetical)
  siteVisitFrequencyHigh: number; // Multiple visits in a short period
  sessionDurationLong: number; // Long average session duration
  emailSubscription: number; // Added to track if user is subscribed
}

export interface LeadScoreComponents {
  behavioralScore: Partial<BehavioralScoreMetrics> & { currentTotal?: number };
  demographicScore: Partial<DemographicScoreMetrics> & { currentTotal?: number };
  engagementQualityScore: Partial<EngagementQualityScoreMetrics> & { currentTotal?: number };
  totalScore: number;
}

export type LeadStage = 
  | 'AnonymousVisitor'    // 0-20
  | 'IdentifiedProspect'  // 21-40 (e.g. email submitted)
  | 'EngagedLead'         // 41-60 (e.g. interacting with content)
  | 'MarketingQualifiedLead' // 61-80 (e.g. strong behavioral signals, good demo fit)
  | 'SalesQualifiedLead'  // 81-100 (e.g. high score, direct interest like pricing/calendar)
  | 'Opportunity'         // Service inquiry made / Consult booked
  | 'Customer'            // Service enrolled
  | 'Advocate';           // Referral generator / high positive engagement post-purchase

// Conceptual: Actual pipeline stages would be more complex and service-specific
export type PipelineStage = 
  | 'InitialInterest'
  | 'EducationPhase'
  | 'Consideration'
  | 'Evaluation'
  | 'Proposal'
  | 'Negotiations'
  | 'ClosedWon'
  | 'ClosedLost'
  | 'Onboarding'
  | 'ActiveService'
  | 'SuccessRenewal';

export interface AutomatedTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  assignedTo?: string; // User ID or role
  relatedLeadId?: string; // Visitor ID or CRM Lead ID
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  priority: 'low' | 'medium' | 'high';
  triggerEvent?: string; // Event that created the task
}


export interface VisitorProfile {
  isFirstTimeVisitor: boolean;
  determinedPersonaId: PersonaId | null;
  engagementScore: number; // 0-100 (general site engagement, distinct from lead score components)
  engagementLevel: EngagementLevel;
  trafficSource: string | null; // e.g., 'organic_google', 'paid_facebook_campaign_xyz', 'direct'
  deviceType: DeviceType;
  geolocation?: { city?: string; country?: string; region?: string }; // Basic, from IP if available (backend)
  interactionHistory: InteractionEvent[];
  isEmailSubscriber: boolean;
  serviceInquiryState: ServiceInquiryState;
  abTestGroups?: Record<string, string>; // e.g. { 'heroTest': 'variantB' }
  
  // CRM / Lead Management Fields
  leadScore: LeadScoreComponents;
  leadStage: LeadStage;
}


export interface PersonalizationRuleCondition {
  attribute: keyof VisitorProfile | string; // Allows targeting custom attributes
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'inArray';
  value: any;
}

export interface PersonalizationRuleAction {
  type: 'showContent' | 'hideContent' | 'setVariant' | 'applyClass' | 'redirect';
  targetElementId?: string; // For show/hide/applyClass
  contentKey?: string;      // Key to fetch dynamic content
  variantKey?: string;      // Key for specific content variant
  className?: string;       // For applyClass
  url?: string;             // For redirect
}

export interface PersonalizationRule {
  id: string;
  description: string;
  priority: number; // Lower numbers run first
  conditions: PersonalizationRuleCondition[]; // AND logic between conditions
  actions: PersonalizationRuleAction[];
}

export interface DynamicContentVariant {
  key: string; // e.g., 'headline_launch_new', 'cta_high_engagement'
  content: string | Record<string, any>; // String for simple text, object for complex elements
}

export interface PersonalizedContentPayload {
  heroSection?: {
    headline: string;
    subtext?: string;
    cta?: { text: string; action: string; variant?: string; };
    backgroundImage?: string;
  };
  pricingDisplay?: {
    tierToHighlight: string;
    showPaymentPlansFirst: boolean;
    testimonialId?: string; 
  };
  contentSlots?: Record<string, DynamicContentVariant>;
}

// --- Client Success Platform Types ---
export type ClientPortalSection = 'onboarding' | 'dashboard' | 'communication' | 'success_metrics' | 'retention_expansion' | 'profile_settings';

export interface ClientOnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  subSteps?: ClientOnboardingStep[];
  relatedAction?: { text: string, link?: string, onClick?: () => void };
  estimatedTime?: string; // e.g. "15 mins"
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string; // e.g. "Business License", "Supplier Agreement"
  status: 'pending_submission' | 'submitted_for_review' | 'verified' | 'rejected_needs_resubmission';
  notes?: string;
  uploadDate?: string; // ISO Date string
  requiredForService: PersonaId[]; // Which services this doc is for
}

export interface ClientGoal {
  id: string;
  text: string;
  category: 'financial' | 'operational' | 'learning' | 'personal_growth';
  targetDate?: string; // ISO Date string
  isAchieved: boolean;
  notes?: string;
}

export interface ClientCommunicationPreference {
  primaryContactMethod: 'email' | 'platform_message' | 'video_call';
  secondaryContactMethod?: 'email' | 'platform_message' | 'video_call';
  meetingFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'as_needed';
  preferredMeetingTimes?: string; // e.g. "Weekdays 9am-12pm ET"
  notificationPreferences: {
    newTasks: boolean;
    milestoneUpdates: boolean;
    documentStatus: boolean;
    communityMentions: boolean;
  };
}

export interface ClientProgramTask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string; // ISO Date string
  relatedResourceLink?: string; // Link to a resource in LMS or main site
  notes?: string;
  subTasks?: ClientProgramTask[];
  assignedTo?: 'client' | 'coach' | 'system'; // Who is responsible
}

export interface ClientProgramMilestone {
  id: string;
  phase: string; // e.g. "Phase 1: Foundation & Product"
  title: string;
  targetDate?: string; // ISO Date string
  isAchieved: boolean;
  tasks: ClientProgramTask[];
  achievementCriteria?: string;
  celebrationAction?: { text: string, type: 'popup' | 'email_trigger' };
}

export interface ClientKPI {
  id: string;
  metricName: string;
  currentValue: string | number;
  targetValue: string | number;
  unit: string; // e.g., "$", "%", "units"
  trend?: 'up' | 'down' | 'flat';
  lastUpdated?: string; // ISO Date string
}

// --- Service Specific Dashboard Data States ---
export interface LaunchProgramClientData {
  currentRoadmapDay: number; // Day 1-60
  activeMilestoneId: string | null;
  completedTasks: Set<string>; // IDs of ClientProgramTask
  productSelectionFrameworkAnswers?: any; // Store answers from this specific tool
  riskAssessmentChecklistAnswers?: any; // Store answers from this specific tool
}

export interface ScaleProgramClientData {
  diagnosticResultsSummary?: any;
  activeOptimizationFrameworkId?: string;
  implementedSOPs: Set<string>;
  roiTracked?: { metric: string, value: number }[];
}

export interface MasterProgramClientData {
  knowledgeAssessmentScores?: Record<string, number>; // domainId: score
  activeLearningModuleId?: string;
  completedImplementationExercises: Set<string>;
  conceptualFrameworkConfidence?: Record<string, number>; // frameworkId: confidence_score
}

export interface InvestProgramClientData {
  portfolioAnalysisSummary?: any;
  activeDueDiligenceDealId?: string;
  completedDiligenceItems: Set<string>; // For active deal
  investmentThesisNotes?: string;
}

export interface ConnectProgramClientData {
  servicePositioningScore?: number;
  idealClientProfileNotes?: string;
  activeClientAcquisitionCampaigns?: { name: string, status: string }[];
  valueDemonstrationAssets?: { name: string, link: string, type: 'case_study' | 'testimonial_video' }[];
}


export interface ClientSuccessState {
  isLoading: boolean;
  activePortalSection: ClientPortalSection;
  clientPersonaId: PersonaId | null; // Example: 'launch'
  clientName: string; // Example: "Valued Client"

  // Onboarding
  onboardingChecklist: ClientOnboardingStep[];
  documents: ClientDocument[];
  goals: ClientGoal[];
  communicationPreferences: ClientCommunicationPreference | null;
  isOnboardingComplete: boolean;

  // Program Delivery (Union type or specific states)
  currentProgramData: LaunchProgramClientData | ScaleProgramClientData | MasterProgramClientData | InvestProgramClientData | ConnectProgramClientData | null;
  programMilestones: ClientProgramMilestone[]; // Specific to the client's enrolled program

  // Communication
  unreadMessagesCount: number;
  upcomingAppointments: { title: string, date: string, type: 'coaching_call' | 'mastermind' }[];

  // Success Metrics
  kpis: ClientKPI[];
  satisfactionScore: number | null; // 0-10
  testimonialSubmitted: boolean;

  // Actions
  setActivePortalSection: (section: ClientPortalSection) => void;
  loadClientData: (assumedPersonaId: PersonaId) => Promise<void>;
  
  // Onboarding Actions
  completeOnboardingStep: (stepId: string, subStepId?: string) => void;
  addDocument: (doc: Omit<ClientDocument, 'id' | 'status'>) => void;
  updateDocumentStatus: (docId: string, status: ClientDocument['status'], notes?: string) => void;
  addGoal: (goal: Omit<ClientGoal, 'id'| 'isAchieved'>) => void;
  updateGoal: (goalId: string, updates: Partial<ClientGoal>) => void;
  toggleGoalAchieved: (goalId: string) => void;
  saveCommunicationPreferences: (prefs: ClientCommunicationPreference) => void;
  completeOnboarding: () => void;

  // Program Specific Actions (example for Launch)
  completeLaunchProgramTask: (milestoneId: string, taskId: string, subTaskId?: string) => void;
  updateLaunchFrameworkAnswers: (framework: 'productSelection' | 'riskAssessment', answers: any) => void;
  
  // General Actions
  submitTestimonial: (text: string, rating: number) => void;
  updateClientKPI: (kpiId: string, currentValue: string | number) => void;

  _hydrateClientState: (persistedState: Partial<ClientSuccessState>) => void;
}
