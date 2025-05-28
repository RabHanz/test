
import useVisitorStore from '../store/visitorStore';
import { LEAD_SCORING_POINTS } from '../constants'; // Only for specific point values if needed directly by tracking logic
import type { BehavioralTrackingEventName, PersonaId } from '../types';

// This function is the core logger, now directly using the store.
const logInteractionWithEngagement = (eventName: BehavioralTrackingEventName | string, properties?: Record<string, any>, engagementPoints: number = 1) => {
  console.log(`Tracked Event: ${eventName}`, properties);
  const visitorStore = useVisitorStore.getState();
  visitorStore.logInteraction(eventName, properties);
  // General engagement score (distinct from lead score) can still be incremented if desired
  // visitorStore.incrementEngagement(engagementPoints, eventName);

  // Trigger lead score update (already part of visitorStore.logInteraction which calls _updateLeadScoreAndStage)
};


export const trackCTAClick = (ctaName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement('cta_click', { cta_name: ctaName, ...properties }, 2);
};

export const trackNavClick = (navItemLabel: string): void => {
  logInteractionWithEngagement('navigation_click', { item_label: navItemLabel });
};

export const trackPersonaCardClick = (personaTitle: string): void => {
  logInteractionWithEngagement('persona_card_click', { persona_title: personaTitle }, 2);
};

export const trackQuizEvent = (eventName: string, properties?: Record<string, any>): void => {
  let points = 1;
  // Ensure eventName is a valid key for LEAD_SCORING_POINTS.behavioral if used directly
  const eventFullKey = `quiz_${eventName}` as `quiz_${keyof typeof LEAD_SCORING_POINTS.behavioral}`;

  if (eventName === 'email_submitted') points = 3; // Generic point for email submission
  if (eventName === 'completed') points = LEAD_SCORING_POINTS.behavioral.quizCompletion;

  logInteractionWithEngagement(eventFullKey, properties, points);

  if (eventName === 'email_submitted') {
    trackEmailSubmittedToPlatform(properties?.email, 'Quiz Submission');
    useVisitorStore.getState().setEmailSubscriberStatus(true); // CRM related
  }
  if (eventName === 'completed') {
    trackLeadToCRM(properties?.email, properties?.result?.primaryPersona?.title || 'Unknown', properties);
    if(properties?.result?.primaryPersona?.id){
      useVisitorStore.getState().setDeterminedPersona(properties.result.primaryPersona.id);
    }
  }
};

export const trackDashboardEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`dashboard_${eventName}`, properties);
};

// Hub Specific Event Trackers
export const trackLaunchHubEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`launch_hub_${eventName}`, properties, eventName.includes('completed') || eventName.includes('assessment') ? 5 : 2);
};
export const trackScaleHubEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`scale_hub_${eventName}`, properties, eventName.includes('completed') || eventName.includes('diagnostic') ? 5 : 2);
};
export const trackMasterHubEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`master_hub_${eventName}`, properties, eventName.includes('completed') || eventName.includes('assessment') ? 5 : 2);
};
export const trackInvestHubEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`invest_hub_${eventName}`, properties, eventName.includes('completed') || eventName.includes('assessment') ? 5 : 2);
};
export const trackConnectHubEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`connect_hub_${eventName}`, properties, eventName.includes('completed') || eventName.includes('assessment') ? 5 : 2);
};


// Specific Behavioral Tracking Functions
export const trackExitIntentShown = (personaContext: PersonaId | 'default_exit' | 'unknown') => {
  logInteractionWithEngagement('exit_intent_shown', { persona_context: personaContext }, 0);
};

export const trackExitIntentConversion = (persona: string, email: string) => {
  logInteractionWithEngagement('exit_intent_conversion', { persona_context: persona, user_email_captured: true }, 5);
};

export const trackEmailSubmittedToPlatform = (email: string | undefined, source: string) => {
  if (!email) return;
  console.log(`Integration: Email ${email} submitted from ${source} to Email Platform (e.g., ConvertKit/Mailchimp)`);
  useVisitorStore.getState().setEmailSubscriberStatus(true);
};

export const trackLeadToCRM = (email: string | undefined, persona: string | undefined, details: any) => {
  if (!email) return;
  console.log(`Integration: Lead ${email} (Persona: ${persona}) data sent to CRM`, details);
};

export const trackScrollDepth = (page: string, depthPercentage: number) => {
  logInteractionWithEngagement('scroll_depth', { page_identifier: page, scroll_percentage: depthPercentage }, Math.floor(depthPercentage / 25));
};

export const trackVideoView = (videoId: string, eventType: 'start' | 'progress' | 'complete', progressPercent?: number) => {
  let points = 0;
  let eventName: BehavioralTrackingEventName = 'video_view_start';
  if (eventType === 'progress' && progressPercent) {
    if (progressPercent >= 75) { points = LEAD_SCORING_POINTS.behavioral.videoEngagement75Plus; eventName = 'video_milestone_75'; }
    else if (progressPercent >= 50) { points = 2; eventName = 'video_milestone_50'; }
    else if (progressPercent >= 25) { points = 1; eventName = 'video_milestone_25'; }
  } else if (eventType === 'complete') {
    points = LEAD_SCORING_POINTS.behavioral.videoEngagement75Plus;
    eventName = 'video_completed';
  }
  logInteractionWithEngagement(eventName, { video_id: videoId, video_event_type: eventType, video_progress_percent: progressPercent }, points);
};

export const trackToolUsage = (toolName: string, eventType: 'started' | 'completed' | 'abandoned_step_X', personaContext?: string, details?: any) => {
  let points = 1;
  let eventFullKey: BehavioralTrackingEventName | string = `tool_usage_${eventType}`;
  if(eventType === 'completed') {
    points = LEAD_SCORING_POINTS.behavioral.toolUsageCompleted;
    eventFullKey = 'tool_usage_completed';
  }
  else if (eventType.startsWith('abandoned')) points = -1;
  logInteractionWithEngagement(eventFullKey, { tool_name: toolName, persona_context: personaContext, ...details }, points);
};

export const trackPricingPageInteraction = (serviceName: string, timeSpentSeconds: number, hasClickedCTA: boolean) => {
  let eventName: BehavioralTrackingEventName = 'pricing_page_view_brief';
  let points = 1;
  if (hasClickedCTA) {
    eventName = 'pricing_page_cta_click';
    points = LEAD_SCORING_POINTS.behavioral.pricingPageExtendedVisit;
  } else if (timeSpentSeconds > 30) {
    eventName = 'pricing_page_view_extended';
    points = LEAD_SCORING_POINTS.behavioral.pricingPageExtendedVisit;
  }
  logInteractionWithEngagement(eventName, { service_name: serviceName, time_spent_seconds: timeSpentSeconds, clicked_cta: hasClickedCTA }, points);
};

export const trackResourceDownload = (resourceName: string, emailProvided?: boolean) => {
  const eventName: BehavioralTrackingEventName = emailProvided ? 'resource_downloaded_with_email' : 'resource_downloaded_no_email';
  let points = 2;
  if (emailProvided) {
    points = LEAD_SCORING_POINTS.behavioral.resourceDownloadedWithEmail;
  }
  logInteractionWithEngagement(eventName, { resource_name: resourceName, email_provided: !!emailProvided }, points);
};

export const trackServiceInquiryEvent = (eventName:'service_inquiry_started' | 'service_inquiry_abandoned_step_X' | 'service_inquiry_completed', details: any) => {
  let points = 1;
  if(eventName === 'service_inquiry_completed') points = LEAD_SCORING_POINTS.behavioral.serviceInquiryMade;
  if(eventName === 'service_inquiry_started') points = 3;
  logInteractionWithEngagement(eventName, details, points);

  const visitorStore = useVisitorStore.getState();
  if(eventName === 'service_inquiry_started') visitorStore.setServiceInquiryState('started');
  if(eventName === 'service_inquiry_completed') visitorStore.setServiceInquiryState('submitted');
};


export const trackCalendarBookingVisit = () => {
  logInteractionWithEngagement('calendar_page_visit', {}, 3);
};

export const trackCalendarBookingMade = (details?: any) => {
    logInteractionWithEngagement('calendar_booking_made', details, LEAD_SCORING_POINTS.behavioral.calendarBookingMade);
    useVisitorStore.getState().setServiceInquiryState('consult_booked');
};

export const trackPageAbandonment = (pageIdentifier: string, timeOnPageSeconds: number, details?: Record<string, any>) => {
  const points = timeOnPageSeconds < 5 ? -1 : 0;
  logInteractionWithEngagement('page_abandonment', { page_identifier: pageIdentifier, time_on_page_seconds: timeOnPageSeconds, ...details }, points);
};

export const trackToolAbandonment = (toolName: string, lastStepCompleted: string, personaContext?: string, details?: Record<string, any>) => {
  logInteractionWithEngagement('tool_usage_abandonment', { tool_name: toolName, last_step_completed: lastStepCompleted, persona_context: personaContext, ...details }, -2);
};
