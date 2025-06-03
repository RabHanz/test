import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  accentColor?: string;
}

export interface Persona {
  id: PersonaId;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  memberCount: string;
  ctaText: string;
  ctaHref: string;
  accentColorClass: string; 
  borderColorClass: string; 
  buttonColorClass: string; 
  shadowColorClass?: string; 
  longDescription?: string;
  mascotImage?: string; 
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
  personaId?: PersonaId;
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

export type PersonaId = 'launch' | 'scale' | 'master' | 'invest' | 'connect' | 'unknown' | 'default_exit';

export interface QuizAnswerOption {
  id: string;
  text: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  scores: Array<{ personaId: PersonaId; points: number }>;
  crmScoreMapping?: { category: keyof DemographicScoreMetrics; points: number }[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizAnswerOption[];
  skippable?: boolean;
  isSensitive?: boolean;
}

export interface UserAnswers {
  [questionId: string]: string;
}

export interface PersonaScore {
  personaId: PersonaId;
  score: number;
  confidence?: number;
}

export interface QuizResult {
  primaryPersona: Persona | null;
  secondaryPersonas: Persona[];
  allScores: PersonaScore[];
}

export interface QuizState {
  currentStep: number;
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

export type DateRangeOption = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface KpiCardData {
  id: string;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  tooltip?: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

export interface TrafficSourceDetail {
  name: string;
  value: number;
  details?: string[] | { name: string, value: number }[];
}

export interface TrafficSourcesData {
  organic: TrafficSourceDetail;
  social: TrafficSourceDetail & { breakdown?: TrafficSourceDetail[] };
  direct: TrafficSourceDetail;
  email: TrafficSourceDetail & { campaignPerformance?: { name: string, value: number, metric: string }[] };
  paid: TrafficSourceDetail & { roi?: string };
}

export interface PersonaAnalyticsData {
  distribution: ChartDataItem[];
  quizCompletionRates: { source: string, rate: number }[];
  confidenceScores: ChartDataItem[];
}

export interface FunnelStep {
  name: string;
  value: number;
  dropOff?: number;
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
  retargetingEffectiveness: ChartDataItem[];
  emailSequencePerformance: { sequenceName: string, openRate: number, clickRate: number }[];
}

export interface ContentPerformanceData {
  pageEngagement: { page: string, avgTime: string, persona?: PersonaId }[];
  resourceDownloads: { name: string, downloads: number }[];
  videoCompletion: { video: string, rate: number }[];
  communityMetrics: ChartDataItem[];
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

export interface ScaleHeroStat {
  label: string;
  value: string;
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
  diagnosticResults: any | null;
  activeTool: string | null;
  setBusinessHealthScore: (score: number) => void;
  completeDiagnostic: (results: any) => void;
  setActiveTool: (toolId: string | null) => void;
  resetScaleProgress: () => void;
  _loadState: (persistedState: Partial<ScaleHubState>) => void;
}

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
  assessmentResults: Record<string, number>;
  currentLearningPath: string[];
  completedModules: Set<string>;
  knowledgeConfidenceScore: number | null;
  completeKnowledgeAssessment: (results: Record<string, number>) => void;
  setKnowledgeConfidence: (score: number) => void;
  completeModule: (moduleId: string) => void;
  resetMasterProgress: () => void;
  _loadState: (persistedState: Partial<MasterHubState>) => void;
}

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
  clientQualityScore: number | null;
  avgProjectValue: number | null;
  activeClientOpportunities: string[];
  completeServicePositioningAssessment: (score: number) => void;
  updateClientQualityScore: (score: number) => void;
  updateAvgProjectValue: (value: number) => void;
  addClientOpportunity: (opportunityId: string) => void;
  resetConnectProgress: () => void;
  _loadState: (persistedState: Partial<ConnectHubState>) => void;
}

export interface PersonaSpecificExitContent {
  headline: string;
  offer: string;
  ctaText: string;
  accentColorClass: string;
  imageUrl?: string;
}

export interface ExitIntentPopupProps {
  content: PersonaSpecificExitContent;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export interface EmailStep {
  day?: number;
  subject: string;
  previewText?: string;
  body: string;
  cta?: { text: string; link: string; };
  segmentationCriteria?: string;
  personaTarget?: PersonaId[];
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  audiencePersona?: PersonaId[];
  steps: EmailStep[];
}

export type BehavioralTrackingEventName =
  | 'pricing_page_abandonment'
  | 'pricing_page_view_extended'
  | 'pricing_page_cta_click'
  | 'pricing_page_view_brief'
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
  | 'calendar_booking_made'
  | 'multiple_persona_hub_visits'
  | 'low_scroll_depth_bounce'
  | 'ad_blocker_detected'
  | 'service_inquiry_started'
  | 'service_inquiry_abandoned_step_X'
  | 'service_inquiry_completed'
  | 'quiz_email_submitted' // Legacy, prefer 'email_submitted' with context
  | 'email_submitted' // Generic email submission
  | 'quiz_question_answered' // Legacy, prefer 'question_answered' with context
  | 'question_answered' // Generic
  | 'quiz_question_skipped' // Legacy, prefer 'question_skipped' with context
  | 'question_skipped' // Generic
  | 'quiz_completed' // Legacy, prefer 'completed' with context (e.g. quiz_completed)
  | 'completed' // Generic completion event, context added in properties
  | 'quiz_reset' // Legacy, prefer 'reset' with context
  | 'reset' // Generic reset event
  | 'quiz_abandoned_on_load' // Legacy
  | 'abandoned_on_load' // Generic
  | 'quiz_exit_intent_detected' // Legacy
  | 'exit_intent_detected' // Generic
  | 'cta_click'
  | 'navigation_click'
  | 'persona_card_click'
  | 'dashboard_tab_changed'
  | 'dashboard_date_range_changed'
  | 'dashboard_custom_date_range_set'
  | 'dashboard_custom_date_apply_clicked'
  | 'dashboard_fetch_data_started'
  | 'dashboard_fetch_data_completed'
  | 'dashboard_export_report_clicked'
  | 'hub_event_launch' // Specific to launch hub
  | 'launch_hub_roadmap_step_completed'
  | 'launch_hub_roadmap_completed'
  | 'launch_hub_launch_assessment_completed'
  | 'launch_hub_launch_tool_used'
  | 'launch_hub_launch_progress_reset'
  | 'launch_hub_start_launch_assessment_clicked'
  | 'launch_hub_roadmap_tracker_opened'
  | 'launch_hub_service_tier_explore_clicked'
  | 'launch_hub_community_feature_cta_clicked'
  | 'launch_hub_join_community_clicked_launch_hub'
  | 'launch_hub_opp_finder_tool_opened' // Example of specific tool ID event
  | 'launch_hub_profit_calc_tool_opened'
  | 'launch_hub_sel_crit_checklist_download_clicked'
  | 'launch_hub_list_opt_checklist_download_clicked'
  | 'launch_hub_kw_guide_download_clicked'
  | 'launch_hub_preview_clicked' // Generic preview clicked for a tool
  | 'launch_hub_launch_roadmap_resumed' // User rehydrated state in middle of roadmap
  | 'hub_event_scale'
  | 'scale_hub_business_health_score_updated'
  | 'scale_hub_scale_diagnostic_completed'
  | 'scale_hub_scale_tool_activated'
  | 'scale_hub_scale_progress_reset'
  | 'scale_hub_get_business_diagnostic_clicked'
  | 'scale_hub_scale_diagnostic_tool_opened' // Example specific tool
  | 'scale_hub_scale_framework_accessed'
  | 'scale_hub_scale_system_accessed'
  | 'scale_hub_scale_infra_tool_accessed'
  | 'scale_hub_scale_service_explore_clicked'
  | 'scale_hub_scale_interactive_tool_clicked'
  | 'scale_hub_apply_for_mastermind_clicked'
  | 'scale_hub_scale_diagnostic_resumed'
  | 'hub_event_master'
  | 'master_hub_knowledge_assessment_completed'
  | 'master_hub_knowledge_confidence_updated'
  | 'master_hub_master_module_completed'
  | 'master_hub_master_progress_reset'
  | 'master_hub_take_knowledge_assessment_clicked'
  | 'master_hub_ecosystem_model_explored'
  | 'master_hub_ecosystem_component_details_clicked'
  | 'master_hub_framework_details_clicked'
  | 'master_hub_implementation_bridge_accessed'
  | 'master_hub_learning_dashboard_viewed'
  | 'master_hub_mastery_method_details_clicked'
  | 'master_hub_certification_path_clicked'
  | 'master_hub_master_service_explore_clicked'
  | 'master_hub_master_interactive_tool_clicked'
  | 'master_hub_master_community_feature_cta_clicked'
  | 'master_hub_join_master_community_clicked'
  | 'master_hub_master_assessment_resumed'
  | 'hub_event_invest'
  | 'invest_hub_investment_assessment_completed'
  | 'invest_hub_portfolio_value_updated'
  | 'invest_hub_active_deal_set'
  | 'invest_hub_invest_progress_reset'
  | 'invest_hub_risk_return_calc_hero_clicked'
  | 'invest_hub_access_investment_assessment_clicked'
  | 'invest_hub_download_dd_checklist_clicked'
  | 'invest_hub_valuation_calculator_opened'
  | 'invest_hub_risk_matrix_tool_opened'
  | 'invest_hub_portfolio_dashboard_opened'
  | 'invest_hub_view_deal_details_clicked'
  | 'invest_hub_invest_service_explore_clicked'
  | 'invest_hub_invest_analytical_tool_clicked'
  | 'invest_hub_investor_network_feature_clicked'
  | 'invest_hub_join_investor_network_clicked'
  | 'invest_hub_invest_assessment_resumed'
  | 'hub_event_connect'
  | 'connect_hub_service_positioning_assessment_completed'
  | 'connect_hub_client_quality_score_updated'
  | 'connect_hub_avg_project_value_updated'
  | 'connect_hub_client_opportunity_added'
  | 'connect_hub_connect_progress_reset'
  | 'connect_hub_improve_client_quality_score_clicked'
  | 'connect_hub_increase_avg_project_value_clicked'
  | 'connect_hub_complete_service_assessment_clicked'
  | 'connect_hub_expertise_tool_accessed'
  | 'connect_hub_expertise_framework_downloaded'
  | 'connect_hub_acquisition_tool_accessed'
  | 'connect_hub_acquisition_framework_downloaded'
  | 'connect_hub_value_demo_tool_accessed'
  | 'connect_hub_value_demo_framework_downloaded'
  | 'connect_hub_positioning_tool_accessed'
  | 'connect_hub_positioning_framework_downloaded'
  | 'connect_hub_connection_opportunity_clicked'
  | 'connect_hub_biz_dev_tool_clicked'
  | 'connect_hub_connect_service_explore_clicked'
  | 'connect_hub_provider_community_feature_clicked'
  | 'connect_hub_join_provider_community_clicked'
  | 'connect_hub_connect_assessment_resumed'
  | 'exit_intent_shown'
  | 'exit_intent_conversion'
  | 'scroll_depth'
  | 'persona_determined'
  | 'engagement_score_changed' // Generic engagement score change
  | 'identified_as_subscriber'
  | 'identified_as_non_subscriber'
  | 'service_inquiry_state_changed'
  | 'multiple_pricing_page_visits_logged'
  | 'email_link_clicked'
  | 'social_media_post_interaction'
  | 'community_post_created'
  | 'community_comment_made'
  | 'quiz_demographics_processed' // Internal event for lead scoring refresh
  | 'integrations_tab_changed'
  | 'integrations_crm_connect_attempt'
  | 'integrations_crm_disconnect_attempt'
  | 'integrations_crm_field_mapping_updated'
  | 'integrations_crm_sync_triggered'
  | 'integrations_email_connect_attempt'
  | 'integrations_email_disconnect_attempt'
  | 'integrations_email_rule_updated'
  | 'integrations_automation_rule_created'
  | 'integrations_automation_rule_updated'
  | 'integrations_automation_rule_deleted'
  | 'integrations_report_generated';


export type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';
export type ServiceInquiryState = 'none' | 'started' | 'submitted' | 'consult_booked';

export interface InteractionEvent {
  type: BehavioralTrackingEventName | string;
  timestamp: number;
  details?: Record<string, any>;
}

// --- CRM & LEAD MANAGEMENT TYPES ---
export interface BehavioralScoreMetrics {
  quizCompletion: number;
  videoEngagement75Plus: number;
  toolUsageCompleted: number;
  multiplePageVisitsHighValue: number;
  resourceDownloadedWithEmail: number;
  pricingPageExtendedVisit: number;
  serviceInquiryMade: number;
  calendarBookingMade: number;
  // Other event types can be added dynamically or through a generic catch-all
  [key: string]: number; // Allow other keys for dynamic event scoring
}

export interface DemographicScoreMetrics {
  personaAlignmentStrong: number;
  personaAlignmentMedium: number; // Not explicitly used but good to have for flexibility
  businessStageAppropriate: number;
  budgetIndicationPositive: number;
  [key: string]: number;
}

export interface EngagementQualityScoreMetrics {
  emailInteractionPositive: number;
  socialMediaEngagementHigh: number;
  communityParticipationActive: number;
  siteVisitFrequencyHigh: number;
  sessionDurationLong: number;
  emailSubscription: number;
  [key: string]: number;
}

export interface LeadScoreComponents {
  behavioralScore: Partial<BehavioralScoreMetrics> & { currentTotal?: number };
  demographicScore: Partial<DemographicScoreMetrics> & { currentTotal?: number };
  engagementQualityScore: Partial<EngagementQualityScoreMetrics> & { currentTotal?: number };
  totalScore: number;
}

export type LeadStage = 
  | 'AnonymousVisitor'
  | 'IdentifiedProspect'
  | 'EngagedLead'
  | 'MarketingQualifiedLead'
  | 'SalesQualifiedLead'
  | 'Opportunity'
  | 'Customer'
  | 'Advocate';

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
  dueDate?: string;
  assignedTo?: string;
  relatedLeadId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  priority: 'low' | 'medium' | 'high';
  triggerEvent?: string;
}

export interface VisitorProfile {
  isFirstTimeVisitor: boolean;
  determinedPersonaId: PersonaId | null;
  engagementScore: number;
  engagementLevel: EngagementLevel;
  trafficSource: string | null;
  deviceType: DeviceType;
  geolocation?: { city?: string; country?: string; region?: string };
  interactionHistory: InteractionEvent[];
  isEmailSubscriber: boolean;
  serviceInquiryState: ServiceInquiryState;
  abTestGroups?: Record<string, string>;
  
  leadScore: LeadScoreComponents;
  leadStage: LeadStage;
}

export interface PersonalizationRuleCondition {
  attribute: keyof VisitorProfile | string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'inArray';
  value: any;
}

export interface PersonalizationRuleAction {
  type: 'showContent' | 'hideContent' | 'setVariant' | 'applyClass' | 'redirect';
  targetElementId?: string;
  contentKey?: string;
  variantKey?: string;
  className?: string;
  url?: string;
}

export interface PersonalizationRule {
  id: string;
  description: string;
  priority: number;
  conditions: PersonalizationRuleCondition[];
  actions: PersonalizationRuleAction[];
}

export interface DynamicContentVariant {
  key: string;
  content: string | Record<string, any>;
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

// --- INTEGRATIONS DASHBOARD TYPES ---
export interface CRMFieldMapping {
  eoField: string; // e.g., "leadScore.totalScore", "determinedPersonaId"
  crmField: string; // e.g., "hubspot.contact.lead_score", "hubspot.contact.persona"
  direction: 'to_crm' | 'from_crm' | 'bidirectional';
  isEnabled: boolean;
}

export interface EmailListSegmentationRule {
  id: string;
  name: string;
  description?: string;
  personaId?: PersonaId;
  minLeadScore?: number;
  maxLeadScore?: number;
  emailListName: string; // Name of the list in Mailchimp
  isEnabled: boolean;
}

export interface AutomationRuleAction {
  type: 'assign_team_member' | 'send_notification' | 'add_to_crm_pipeline_stage' | 'trigger_email_sequence';
  params: Record<string, any>; // e.g., { teamMemberId: 'xyz' }, { pipelineStage: 'SQL' }, { sequenceId: 'abc' }
}
export interface AutomationRuleTrigger {
  type: 'lead_score_reaches' | 'persona_assigned' | 'crm_stage_changed' | 'email_link_clicked';
  condition: Record<string, any>; // e.g., { score: 70 }, { personaId: 'scale' }, { stage: 'MQL' }
}
export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationRuleTrigger;
  actions: AutomationRuleAction[];
  isEnabled: boolean;
}

export interface IntegrationLogEntry {
  timestamp: number;
  type: 'sync' | 'error' | 'connection_status';
  platform: 'HubSpot' | 'Mailchimp' | 'Internal';
  message: string;
  details?: Record<string, any>;
}

export interface IntegrationsDashboardState {
  activeTab: string;
  // HubSpot
  hubspotApiKey: string;
  isHubspotConnected: boolean;
  hubspotFieldMappings: CRMFieldMapping[];
  hubspotLastSync?: Date | null;
  hubspotSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  // Mailchimp
  mailchimpApiKey: string;
  isMailchimpConnected: boolean;
  mailchimpListRules: EmailListSegmentationRule[];
  mailchimpLastSync?: Date | null;
  mailchimpSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  // Automation
  automationRules: AutomationRule[];
  // General
  integrationLogs: IntegrationLogEntry[];
  isLoading: boolean;

  setActiveTab: (tabId: string) => void;
  setHubspotApiKey: (key: string) => void;
  toggleHubspotConnection: () => void;
  updateHubspotFieldMapping: (mapping: CRMFieldMapping) => void;
  triggerHubspotSync: () => void;
  setMailchimpApiKey: (key: string) => void;
  toggleMailchimpConnection: () => void;
  updateMailchimpListRule: (rule: EmailListSegmentationRule) => void;
  triggerMailchimpSync: () => void;
  addAutomationRule: (rule: Omit<AutomationRule, 'id'>) => void;
  updateAutomationRule: (rule: AutomationRule) => void;
  deleteAutomationRule: (ruleId: string) => void;
  addLogEntry: (log: Omit<IntegrationLogEntry, 'timestamp'>) => void;
  
  _loadIntegrationsState: (persistedState: Partial<IntegrationsDashboardState>) => void;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

export interface VerificationToken {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}

export interface EmailVerification {
  token: string;
}

export interface GoogleAuthResponse {
  credential: string;
}