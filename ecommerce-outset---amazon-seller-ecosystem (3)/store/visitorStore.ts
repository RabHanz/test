
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    VisitorProfile, PersonaId, EngagementLevel, DeviceType, InteractionEvent, ServiceInquiryState,
    BehavioralTrackingEventName, LeadScoreComponents, LeadStage, UserAnswers,
    BehavioralScoreMetrics, DemographicScoreMetrics, EngagementQualityScoreMetrics
} from '../types';
import {
    LEAD_SCORING_POINTS, LEAD_STAGE_THRESHOLDS, QUIZ_QUESTIONS
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
  setDeterminedPersona: (personaId: PersonaId | null) => void;
  incrementEngagement: (points: number, eventName?: string) => void; // General site engagement
  logInteraction: (interactionType: BehavioralTrackingEventName | string, details?: Record<string, any>) => void;
  setEmailSubscriberStatus: (isSubscriber: boolean) => void;
  setServiceInquiryState: (state: ServiceInquiryState) => void;
  setABTestGroup: (testName: string, variant: string) => void;
  resetVisitorProfile: () => void;
  _loadProfile: (persistedState: Partial<VisitorStoreState>) => void;

  // CRM / Lead Scoring specific actions
  _updateLeadScoreAndStage: (eventContext: { type: BehavioralTrackingEventName | string; details?: any }) => void;
  processQuizDataForLeadScoring: (answers: UserAnswers, personaId: PersonaId | null) => void;
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
  leadScore: { ...initialLeadScore },
  leadStage: 'AnonymousVisitor',
};

const calculateCategoryTotal = (
    scores: Partial<BehavioralScoreMetrics> | Partial<DemographicScoreMetrics> | Partial<EngagementQualityScoreMetrics>,
    maxPointsValue: number
): number => {
    let sum = 0;
    for (const key in scores) {
        if (key !== 'currentTotal') { // Ensure 'currentTotal' itself is not part of sum
            const value = scores[key as keyof typeof scores];
            if (typeof value === 'number') {
                sum += value;
            }
        }
    }
    return Math.min(sum, maxPointsValue);
};


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
          trafficSource: state.trafficSource || trafficSource,
        }));
      },

      setDeterminedPersona: (personaId) => {
        set(state => ({
          determinedPersonaId: personaId,
        }));
        get().logInteraction('persona_determined', { personaId });
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

        let engagementPoints = 1;
        if (interactionType.includes('completed') || interactionType.includes('download') || interactionType.includes('submit')) engagementPoints = 5;
        if (interactionType.includes('pricing') || interactionType.includes('service_inquiry')) engagementPoints = 3;
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
        set({...initialVisitorProfile, leadScore: {...initialLeadScore}});
        get().initializeVisitorProfile();
        console.log('Visitor profile reset and re-initialized.');
      },

      _updateLeadScoreAndStage: (eventContext) => {
        const { type: eventType, details } = eventContext;
        const currentScores = get().leadScore;
        let updatedBehavioralScore = { ...currentScores.behavioralScore };
        let updatedDemographicScore = { ...currentScores.demographicScore };
        let updatedEngagementQualityScore = { ...currentScores.engagementQualityScore };

        // Behavioral Scoring
        if (eventType === 'quiz_completed') {
          updatedBehavioralScore.quizCompletion = (updatedBehavioralScore.quizCompletion || 0) + LEAD_SCORING_POINTS.behavioral.quizCompletion;
        } else if (eventType === 'video_milestone_75' || eventType === 'video_completed') {
          updatedBehavioralScore.videoEngagement75Plus = (updatedBehavioralScore.videoEngagement75Plus || 0) + LEAD_SCORING_POINTS.behavioral.videoEngagement75Plus;
        } else if (eventType === 'tool_usage_completed') {
          updatedBehavioralScore.toolUsageCompleted = (updatedBehavioralScore.toolUsageCompleted || 0) + LEAD_SCORING_POINTS.behavioral.toolUsageCompleted;
        } else if (eventType === 'resource_downloaded_with_email') {
          updatedBehavioralScore.resourceDownloadedWithEmail = (updatedBehavioralScore.resourceDownloadedWithEmail || 0) + LEAD_SCORING_POINTS.behavioral.resourceDownloadedWithEmail;
        } else if (eventType === 'pricing_page_view_extended' || eventType === 'pricing_page_cta_click') {
          updatedBehavioralScore.pricingPageExtendedVisit = (updatedBehavioralScore.pricingPageExtendedVisit || 0) + LEAD_SCORING_POINTS.behavioral.pricingPageExtendedVisit;
        } else if (eventType === 'service_inquiry_completed') {
          updatedBehavioralScore.serviceInquiryMade = (updatedBehavioralScore.serviceInquiryMade || 0) + LEAD_SCORING_POINTS.behavioral.serviceInquiryMade;
        } else if (eventType === 'calendar_booking_made') {
          updatedBehavioralScore.calendarBookingMade = (updatedBehavioralScore.calendarBookingMade || 0) + LEAD_SCORING_POINTS.behavioral.calendarBookingMade;
        } else if (Object.prototype.hasOwnProperty.call(LEAD_SCORING_POINTS.behavioral, eventType) && eventType !== 'maxPoints' && eventType !== 'defaultInteraction') {
            const key = eventType as keyof BehavioralScoreMetrics;
            updatedBehavioralScore[key] = (updatedBehavioralScore[key] || 0) + (LEAD_SCORING_POINTS.behavioral[key] || LEAD_SCORING_POINTS.behavioral.defaultInteraction);
        }

        updatedBehavioralScore.currentTotal = calculateCategoryTotal(updatedBehavioralScore, LEAD_SCORING_POINTS.behavioral.maxPoints);

        // Engagement Quality Scoring
        if (eventType === 'identified_as_subscriber') {
            updatedEngagementQualityScore.emailSubscription = (updatedEngagementQualityScore.emailSubscription || 0) + LEAD_SCORING_POINTS.engagementQuality.emailSubscription;
        }
        // Add more for site visit frequency, session duration if tracked. For now, these are placeholders.
        // updatedEngagementQualityScore.siteVisitFrequencyHigh = ...
        // updatedEngagementQualityScore.sessionDurationLong = ...
        updatedEngagementQualityScore.currentTotal = calculateCategoryTotal(updatedEngagementQualityScore, LEAD_SCORING_POINTS.engagementQuality.maxPoints);


        // Demographic scoring - personaAlignment is primary here, others from quiz
        if (eventType === 'persona_determined' && details?.personaId) {
            const personaId = details.personaId as PersonaId;
            updatedDemographicScore.personaAlignmentStrong = 0; // Reset
            updatedDemographicScore.personaAlignmentMedium = 0; // Reset

            if (personaId !== 'unknown' && personaId !== 'default_exit') {
                 updatedDemographicScore.personaAlignmentStrong = LEAD_SCORING_POINTS.demographic.personaAlignmentStrong;
            }
            // Note: businessStage and budgetIndication are set by processQuizDataForLeadScoring
        }
        updatedDemographicScore.currentTotal = calculateCategoryTotal(updatedDemographicScore, LEAD_SCORING_POINTS.demographic.maxPoints);


        const newTotalScore = (updatedBehavioralScore.currentTotal || 0) +
                              (updatedDemographicScore.currentTotal || 0) +
                              (updatedEngagementQualityScore.currentTotal || 0);

        let newLeadStage: LeadStage = 'AnonymousVisitor';
        if (get().serviceInquiryState === 'consult_booked' || get().serviceInquiryState === 'submitted') {
            newLeadStage = 'Opportunity';
        } else {
            const stages = Object.keys(LEAD_STAGE_THRESHOLDS) as LeadStage[];
            for (const stage of stages.sort((a,b) => LEAD_STAGE_THRESHOLDS[b] - LEAD_STAGE_THRESHOLDS[a])) {
                if (newTotalScore >= LEAD_STAGE_THRESHOLDS[stage] && stage !== 'Customer' && stage !== 'Advocate' && stage !== 'Opportunity') { // Opportunity handled above
                    newLeadStage = stage;
                    break;
                }
            }
        }
        
        // Prevent stage regression unless it's to Opportunity
        const currentStageIndex = Object.keys(LEAD_STAGE_THRESHOLDS).indexOf(get().leadStage);
        const newStageIndex = Object.keys(LEAD_STAGE_THRESHOLDS).indexOf(newLeadStage);

        if (newLeadStage !== 'Opportunity' && 
            get().leadStage !== 'Customer' && 
            get().leadStage !== 'Advocate' && 
            newStageIndex < currentStageIndex) {
             newLeadStage = get().leadStage; // Keep current stage if new calculated stage is lower (and not Opportunity)
        }


        set({
            leadScore: {
                behavioralScore: updatedBehavioralScore,
                demographicScore: updatedDemographicScore,
                engagementQualityScore: updatedEngagementQualityScore,
                totalScore: newTotalScore
            },
            leadStage: newLeadStage
        });
      },

      processQuizDataForLeadScoring: (answers, personaId) => {
        let updatedDemographicScore = { ...(get().leadScore.demographicScore || { currentTotal: 0 }) };
        // Reset quiz-specific demographic scores before recalculating
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

        // Persona alignment scoring
        updatedDemographicScore.personaAlignmentStrong = 0; // Reset
        updatedDemographicScore.personaAlignmentMedium = 0; // Reset
        if (personaId && personaId !== 'unknown' && personaId !== 'default_exit') {
            updatedDemographicScore.personaAlignmentStrong = LEAD_SCORING_POINTS.demographic.personaAlignmentStrong;
        }

        updatedDemographicScore.currentTotal = calculateCategoryTotal(updatedDemographicScore, LEAD_SCORING_POINTS.demographic.maxPoints);

        set(state => ({
            leadScore: {
                ...state.leadScore,
                demographicScore: updatedDemographicScore,
            }
        }));
        get()._updateLeadScoreAndStage({ type: 'quiz_demographics_processed' });
      },

      _loadProfile: (persistedState) => {
        const loadedState = { ...initialVisitorProfile, ...persistedState };
        loadedState.engagementLevel = getEngagementLevel(loadedState.engagementScore);
        loadedState.interactionHistory = Array.isArray(loadedState.interactionHistory) ? loadedState.interactionHistory : [];
        loadedState.abTestGroups = typeof loadedState.abTestGroups === 'object' && loadedState.abTestGroups !== null ? loadedState.abTestGroups : {};
        loadedState.leadScore = {
            ...initialLeadScore,
            ...(persistedState.leadScore || {}),
            behavioralScore: { ...initialLeadScore.behavioralScore, ...(persistedState.leadScore?.behavioralScore || {}) },
            demographicScore: { ...initialLeadScore.demographicScore, ...(persistedState.leadScore?.demographicScore || {}) },
            engagementQualityScore: { ...initialLeadScore.engagementQualityScore, ...(persistedState.leadScore?.engagementQualityScore || {}) },
        };
        loadedState.leadStage = persistedState.leadStage || 'AnonymousVisitor';
        set(loadedState);
      }
    }),
    {
      name: 'visitor-profile-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadProfile(state);
          setTimeout(() => state.initializeVisitorProfile(), 0);
        }
        if (error) {
          console.error("Failed to rehydrate VisitorStore:", error);
        }
      },
      partialize: (state) => {
        const { initializeVisitorProfile, _loadProfile, _updateLeadScoreAndStage, processQuizDataForLeadScoring, ...rest } = state;
        return rest;
      },
    }
  )
);

if (typeof window !== 'undefined') {
    useVisitorStore.getState().initializeVisitorProfile();
}

export default useVisitorStore;
