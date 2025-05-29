
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    VisitorProfile, PersonaId, EngagementLevel, DeviceType, InteractionEvent, ServiceInquiryState,
    BehavioralTrackingEventName, LeadScoreComponents, LeadStage, UserAnswers,
    BehavioralScoreMetrics, DemographicScoreMetrics, EngagementQualityScoreMetrics
} from '../types';
import {
    LEAD_SCORING_POINTS, LEAD_STAGE_THRESHOLDS, QUIZ_QUESTIONS, PERSONAS_DATA
} from '../constants';

const ENGAGEMENT_THRESHOLDS: Record<EngagementLevel, number> = {
  low: 0,
  medium: 30,
  high: 60,
  very_high: 85,
};

const getEngagementLevel = (score: number): EngagementLevel => {
  if (score >= ENGAGEMENT_THRESHOLDS.very_high) return 'very_high';
  if (score >= ENGAGEMENT_THRESHOLDS.high) return 'high';
  if (score >= ENGAGEMENT_THRESHOLDS.medium) return 'medium';
  return 'low';
};

const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getInitialTrafficSource = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('utm_source')) {
      return `utm_source:${params.get('utm_source')}`;
    }
    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.hostname.includes('google.com')) return 'organic_google';
      if (referrerUrl.hostname.includes('facebook.com')) return 'social_facebook';
      if (referrerUrl.hostname === window.location.hostname) return 'internal'; // Internal navigation
      return `referrer:${referrerUrl.hostname}`;
    }
    return 'direct';
  } catch (error) {
    console.warn("Error parsing traffic source:", error);
    return 'unknown';
  }
};


export interface VisitorStoreState extends VisitorProfile {
  initializeVisitorProfile: () => void;
  setDeterminedPersona: (personaId: PersonaId | null, confidence?: number) => void;
  incrementEngagement: (points: number, eventName?: string) => void;
  logInteraction: (interactionType: BehavioralTrackingEventName | string, details?: Record<string, any>) => void;
  setEmailSubscriberStatus: (isSubscriber: boolean) => void;
  setServiceInquiryState: (state: ServiceInquiryState) => void;
  setABTestGroup: (testName: string, variant: string) => void;
  resetVisitorProfile: () => void;
  _loadProfile: (persistedState: Partial<VisitorStoreState>) => void;

  _updateLeadScoreAndStage: (eventContext: { type: BehavioralTrackingEventName | string; details?: any }) => void;
  processQuizDataForLeadScoring: (answers: UserAnswers, primaryPersonaId: PersonaId | null, quizConfidence?: number) => void;
}

const initialLeadScore: LeadScoreComponents = {
  behavioralScore: { currentTotal: 0 },
  demographicScore: { currentTotal: 0 },
  engagementQualityScore: { currentTotal: 0 },
  totalScore: 0,
};

const initialVisitorProfile: VisitorProfile = {
  isFirstTimeVisitor: true,
  determinedPersonaId: null,
  engagementScore: 0,
  engagementLevel: 'low',
  trafficSource: null,
  deviceType: 'unknown',
  interactionHistory: [],
  isEmailSubscriber: false,
  serviceInquiryState: 'none',
  abTestGroups: {},
  leadScore: JSON.parse(JSON.stringify(initialLeadScore)), // Deep copy
  leadStage: 'AnonymousVisitor',
};

const calculateCategoryTotal = (
    scores: Partial<BehavioralScoreMetrics> | Partial<DemographicScoreMetrics> | Partial<EngagementQualityScoreMetrics>,
    maxPointsValue: number
): number => {
    let sum = 0;
    for (const key in scores) {
        if (key !== 'currentTotal') {
            const value = scores[key as keyof typeof scores];
            if (typeof value === 'number') {
                sum += value;
            }
        }
    }
    return Math.min(sum, maxPointsValue);
};

// Define the order of lead stages for progression logic
const LEAD_STAGE_ORDER: LeadStage[] = [
  'AnonymousVisitor',
  'IdentifiedProspect',
  'EngagedLead',
  'MarketingQualifiedLead',
  'SalesQualifiedLead',
  'Opportunity',
  'Customer',
  'Advocate'
];


const useVisitorStore = create<VisitorStoreState>()(
  persist(
    (set, get) => ({
      ...initialVisitorProfile,

      initializeVisitorProfile: () => {
        const isFirstTime = !localStorage.getItem('hasVisitedEcommerceOutset');
        if (isFirstTime && get().interactionHistory.length === 0) {
          localStorage.setItem('hasVisitedEcommerceOutset', 'true');
        }
        const trafficSource = getInitialTrafficSource();

        set(state => ({
          ...state,
          isFirstTimeVisitor: isFirstTime && state.interactionHistory.length === 0,
          deviceType: getDeviceType(),
          trafficSource: state.trafficSource || trafficSource, // Prioritize already set traffic source from hydration
        }));
      },

      setDeterminedPersona: (personaId, confidence) => {
        set(state => ({
          determinedPersonaId: personaId,
        }));
        get().logInteraction('persona_determined', { personaId, confidence });
      },

      incrementEngagement: (points, eventName) => {
        set(state => {
          const newScore = Math.min(100, Math.max(0, state.engagementScore + points));
          return {
            engagementScore: newScore,
            engagementLevel: getEngagementLevel(newScore),
          };
        });
      },

      logInteraction: (interactionType, details) => {
        set(state => ({
          interactionHistory: [...state.interactionHistory, { type: interactionType, timestamp: Date.now(), details }].slice(-50)
        }));

        let engagementPoints = 1; // Default points for general site engagement score
        if (typeof interactionType === 'string') {
            if (interactionType.includes('completed') || interactionType.includes('download') || interactionType.includes('submit')) engagementPoints = 5;
            if (interactionType.includes('pricing') || interactionType.includes('service_inquiry')) engagementPoints = 3;
        }
        get().incrementEngagement(engagementPoints, interactionType);
        get()._updateLeadScoreAndStage({ type: interactionType, details });
      },

      setEmailSubscriberStatus: (isSubscriber) => {
        set({ isEmailSubscriber: isSubscriber });
        get().logInteraction(isSubscriber ? 'identified_as_subscriber' : 'identified_as_non_subscriber');
      },

      setServiceInquiryState: (inquiryState) => {
        set({ serviceInquiryState: inquiryState });
        get().logInteraction('service_inquiry_state_changed', { inquiryState });
      },

      setABTestGroup: (testName: string, variant: string) => {
        set(state => ({
          abTestGroups: { ...state.abTestGroups, [testName]: variant }
        }));
      },
      
      resetVisitorProfile: () => {
        localStorage.removeItem('hasVisitedEcommerceOutset');
        set(JSON.parse(JSON.stringify(initialVisitorProfile))); // Deep copy to reset
        get().initializeVisitorProfile(); // Re-initialize basic info
        console.log('Visitor profile reset and re-initialized.');
      },

      _updateLeadScoreAndStage: (eventContext) => {
        const { type: eventType, details } = eventContext;
        const currentFullState = get();
        let currentLeadScore = JSON.parse(JSON.stringify(currentFullState.leadScore)); // Deep copy

        // Ensure sub-scores are initialized if not present
        currentLeadScore.behavioralScore = currentLeadScore.behavioralScore || {};
        currentLeadScore.demographicScore = currentLeadScore.demographicScore || {};
        currentLeadScore.engagementQualityScore = currentLeadScore.engagementQualityScore || {};


        // Behavioral Scoring Logic
        const behavioralConfig = LEAD_SCORING_POINTS.behavioral;
        let pointsToAdd = 0;
        let specificMetricKey: keyof BehavioralScoreMetrics | null = null;

        if (eventType === 'completed' && details?.context === 'quiz') specificMetricKey = 'quizCompletion';
        else if (eventType === 'video_milestone_75' || eventType === 'video_completed') specificMetricKey = 'videoEngagement75Plus';
        else if (eventType === 'tool_usage_completed') specificMetricKey = 'toolUsageCompleted';
        else if (eventType === 'resource_downloaded_with_email') specificMetricKey = 'resourceDownloadedWithEmail';
        else if (eventType === 'pricing_page_view_extended' || eventType === 'pricing_page_cta_click') specificMetricKey = 'pricingPageExtendedVisit';
        else if (eventType === 'service_inquiry_completed') specificMetricKey = 'serviceInquiryMade';
        else if (eventType === 'calendar_booking_made') specificMetricKey = 'calendarBookingMade';
        // Add other explicit mappings here if needed

        if (specificMetricKey) {
            pointsToAdd = behavioralConfig[specificMetricKey] || behavioralConfig.defaultInteraction;
            currentLeadScore.behavioralScore[specificMetricKey] = (currentLeadScore.behavioralScore[specificMetricKey] || 0) + pointsToAdd;
        } else if (Object.prototype.hasOwnProperty.call(behavioralConfig, eventType) && eventType !== 'maxPoints' && eventType !== 'defaultInteraction') {
            // Generic catch-all for other defined behavioral events
            const genericMetricKey = eventType as keyof BehavioralScoreMetrics;
            pointsToAdd = behavioralConfig[genericMetricKey] || behavioralConfig.defaultInteraction;
            currentLeadScore.behavioralScore[genericMetricKey] = (currentLeadScore.behavioralScore[genericMetricKey] || 0) + pointsToAdd;
        }
        
        currentLeadScore.behavioralScore.currentTotal = calculateCategoryTotal(currentLeadScore.behavioralScore, behavioralConfig.maxPoints);

        // Engagement Quality Scoring
        const engagementConfig = LEAD_SCORING_POINTS.engagementQuality;
        if (eventType === 'identified_as_subscriber') {
            currentLeadScore.engagementQualityScore.emailSubscription = (currentLeadScore.engagementQualityScore.emailSubscription || 0) + engagementConfig.emailSubscription;
        }
        // Hypothetical scores for emailInteractionPositive, socialMediaEngagementHigh, communityParticipationActive, siteVisitFrequencyHigh, sessionDurationLong
        // would be added here if actual tracking mechanisms were in place.
        currentLeadScore.engagementQualityScore.currentTotal = calculateCategoryTotal(currentLeadScore.engagementQualityScore, engagementConfig.maxPoints);

        // Demographic Scoring (personaAlignment is handled here for simplicity, others in processQuizData)
        const demographicConfig = LEAD_SCORING_POINTS.demographic;
        if (eventType === 'persona_determined' && details?.personaId) {
            const personaId = details.personaId as PersonaId;
            currentLeadScore.demographicScore.personaAlignmentStrong = 0; // Reset before setting
            currentLeadScore.demographicScore.personaAlignmentMedium = 0; // Reset
            
            const personaData = PERSONAS_DATA.find(p => p.id === personaId);
            if (personaData && personaId !== 'unknown' && personaId !== 'default_exit') {
                 currentLeadScore.demographicScore.personaAlignmentStrong = demographicConfig.personaAlignmentStrong;
            }
        }
         // businessStageAppropriate & budgetIndicationPositive are set by processQuizDataForLeadScoring
        currentLeadScore.demographicScore.currentTotal = calculateCategoryTotal(currentLeadScore.demographicScore, demographicConfig.maxPoints);


        currentLeadScore.totalScore = (currentLeadScore.behavioralScore.currentTotal || 0) +
                                     (currentLeadScore.demographicScore.currentTotal || 0) +
                                     (currentLeadScore.engagementQualityScore.currentTotal || 0);

        let newLeadStage: LeadStage = 'AnonymousVisitor';
        if (currentFullState.serviceInquiryState === 'consult_booked' || currentFullState.serviceInquiryState === 'submitted') {
            newLeadStage = 'Opportunity';
        } else {
            // Sort stages by threshold descending to find the highest matching stage
            const sortedStages = [...LEAD_STAGE_ORDER].sort((a,b) => LEAD_STAGE_THRESHOLDS[b] - LEAD_STAGE_THRESHOLDS[a]);
            for (const stage of sortedStages) {
                if (currentLeadScore.totalScore >= LEAD_STAGE_THRESHOLDS[stage] && stage !== 'Customer' && stage !== 'Advocate' && stage !== 'Opportunity') {
                    newLeadStage = stage;
                    break;
                }
            }
        }
        
        // Prevent stage regression, unless moving to Opportunity or higher (Customer, Advocate handled manually)
        const currentStageIndex = LEAD_STAGE_ORDER.indexOf(currentFullState.leadStage);
        const newStageIndex = LEAD_STAGE_ORDER.indexOf(newLeadStage);


        if (newLeadStage !== 'Opportunity' && 
            currentFullState.leadStage !== 'Customer' && 
            currentFullState.leadStage !== 'Advocate' && 
            newStageIndex < currentStageIndex) {
             newLeadStage = currentFullState.leadStage; 
        }
        
        set({
            leadScore: currentLeadScore,
            leadStage: newLeadStage
        });
      },

      processQuizDataForLeadScoring: (answers, primaryPersonaId, quizConfidence) => {
        let updatedDemographicScore = JSON.parse(JSON.stringify(get().leadScore.demographicScore || { currentTotal: 0 }));
        
        // Reset scores that are derived from quiz questions
        updatedDemographicScore.businessStageAppropriate = 0;
        updatedDemographicScore.budgetIndicationPositive = 0;

        QUIZ_QUESTIONS.forEach(question => {
            const answerId = answers[question.id];
            if (answerId) {
                const selectedOption = question.options.find(opt => opt.id === answerId);
                if (selectedOption?.crmScoreMapping) {
                    selectedOption.crmScoreMapping.forEach(mapping => {
                        const key = mapping.category as keyof DemographicScoreMetrics;
                        updatedDemographicScore[key] = (updatedDemographicScore[key] || 0) + mapping.points;
                    });
                }
            }
        });
        
        // Persona alignment
        const demographicConfig = LEAD_SCORING_POINTS.demographic;
        updatedDemographicScore.personaAlignmentStrong = 0; // Reset
        updatedDemographicScore.personaAlignmentMedium = 0; // Reset
        if (primaryPersonaId && primaryPersonaId !== 'unknown' && primaryPersonaId !== 'default_exit') {
            if (quizConfidence && quizConfidence >= 70) { // Example threshold for strong alignment
                 updatedDemographicScore.personaAlignmentStrong = demographicConfig.personaAlignmentStrong;
            } else {
                 updatedDemographicScore.personaAlignmentMedium = demographicConfig.personaAlignmentMedium;
            }
        }

        updatedDemographicScore.currentTotal = calculateCategoryTotal(updatedDemographicScore, demographicConfig.maxPoints);

        set(state => ({
            leadScore: {
                ...state.leadScore,
                demographicScore: updatedDemographicScore,
            }
        }));
        // Trigger a general update to recalculate total score and stage
        get()._updateLeadScoreAndStage({ type: 'quiz_demographics_processed' });
      },

      _loadProfile: (persistedState) => {
        const loadedState = { ...initialVisitorProfile, ...persistedState };
        loadedState.engagementLevel = getEngagementLevel(loadedState.engagementScore || 0);
        loadedState.interactionHistory = Array.isArray(loadedState.interactionHistory) ? loadedState.interactionHistory : [];
        loadedState.abTestGroups = typeof loadedState.abTestGroups === 'object' && loadedState.abTestGroups !== null ? loadedState.abTestGroups : {};
        
        // Ensure leadScore and its sub-objects are properly initialized
        const defaultLeadScore = JSON.parse(JSON.stringify(initialLeadScore));
        loadedState.leadScore = {
            behavioralScore: { ...defaultLeadScore.behavioralScore, ...(persistedState.leadScore?.behavioralScore || {}) },
            demographicScore: { ...defaultLeadScore.demographicScore, ...(persistedState.leadScore?.demographicScore || {}) },
            engagementQualityScore: { ...defaultLeadScore.engagementQualityScore, ...(persistedState.leadScore?.engagementQualityScore || {}) },
            totalScore: persistedState.leadScore?.totalScore || 0,
        };
        // Ensure currentTotals are numbers
        loadedState.leadScore.behavioralScore.currentTotal = loadedState.leadScore.behavioralScore.currentTotal || 0;
        loadedState.leadScore.demographicScore.currentTotal = loadedState.leadScore.demographicScore.currentTotal || 0;
        loadedState.leadScore.engagementQualityScore.currentTotal = loadedState.leadScore.engagementQualityScore.currentTotal || 0;

        loadedState.leadStage = persistedState.leadStage || 'AnonymousVisitor';
        loadedState.trafficSource = persistedState.trafficSource || getInitialTrafficSource(); // Ensure traffic source is set on load
        set(loadedState);
      }
    }),
    {
      name: 'visitor-profile-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadProfile(state); // This handles the rehydration logic including defaults for nested objects
          // initializeVisitorProfile must be called after rehydration is complete and state is set
          setTimeout(() => {
            const currentTrafficSource = useVisitorStore.getState().trafficSource;
            // Only call initializeVisitorProfile if trafficSource wasn't properly set by _loadProfile (e.g. first ever load)
            if (!currentTrafficSource || currentTrafficSource === 'unknown') {
                useVisitorStore.getState().initializeVisitorProfile();
            }
          }, 0);
        }
        if (error) {
          console.error("Failed to rehydrate VisitorStore:", error);
        }
      },
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { initializeVisitorProfile, _loadProfile, _updateLeadScoreAndStage, processQuizDataForLeadScoring, ...rest } = state;
        return rest;
      },
    }
  )
);

// Initialize profile on first load if not already handled by rehydration.
// The rehydration logic now attempts to call initializeVisitorProfile if needed.
if (typeof window !== 'undefined' && !useVisitorStore.getState().trafficSource) {
    useVisitorStore.getState().initializeVisitorProfile();
}

export default useVisitorStore;
