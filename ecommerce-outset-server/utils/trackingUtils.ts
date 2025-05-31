import useVisitorStore from '../store/visitorStore';
// LEAD_SCORING_POINTS is mainly used within visitorStore, direct use here might be redundant
import type { BehavioralTrackingEventName, PersonaId } from '../types';

const logInteractionWithEngagement = (eventName: BehavioralTrackingEventName | string, properties?: Record<string, any>) => {
  console.log(`Tracked Event: ${eventName}`, properties);
  // The logInteraction in visitorStore now handles engagement points and lead scoring.
  useVisitorStore.getState().logInteraction(eventName, properties);
};


export const trackCTAClick = (ctaName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement('cta_click', { cta_name: ctaName, ...properties });
};

export const trackNavClick = (navItemLabel: string): void => {
  logInteractionWithEngagement('navigation_click', { item_label: navItemLabel });
};

export const trackPersonaCardClick = (personaTitle: string): void => {
  logInteractionWithEngagement('persona_card_click', { persona_title: personaTitle });
};

// General event tracker for quiz, 'context' property added for clarity.
export const trackQuizEvent = (eventName: string, properties?: Record<string, any>): void => {
  const fullEventName = properties?.context ? `${properties.context}_${eventName}` : eventName;
  logInteractionWithEngagement(fullEventName, properties);

  if (eventName === 'email_submitted') { // This is now the generic 'email_submitted'
    trackEmailSubmittedToPlatform(properties?.email, properties?.context || 'Quiz');
    // No need to call setEmailSubscriberStatus here, as 'identified_as_subscriber' event will be logged via logInteraction chain
  }
  if (eventName === 'completed' && properties?.context === 'quiz') { // Specifically quiz_completed
    trackLeadToCRM(properties?.email, properties?.result?.primaryPersona?.title || 'Unknown', properties);
    // setDeterminedPersona and processQuizDataForLeadScoring are now called within quizStore.calculateResults
  }
};

export const trackDashboardEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`dashboard_${eventName}`, properties);
};

export const trackIntegrationsDashboardEvent = (eventName: string, properties?: Record<string, any>): void => {
  logInteractionWithEngagement(`integrations_${eventName}`, properties);
};


// Hub Specific Event Trackers
const createHubEventTracker = (hubName: string) => (eventName: string, properties?: Record<string, any>) => {
  logInteractionWithEngagement(`${hubName}_hub_${eventName}`, properties);
};

export const trackLaunchHubEvent = createHubEventTracker('launch');
export const trackScaleHubEvent = createHubEventTracker('scale');
export const trackMasterHubEvent = createHubEventTracker('master');
export const trackInvestHubEvent = createHubEventTracker('invest');
export const trackConnectHubEvent = createHubEventTracker('connect');


// Specific Behavioral Tracking Functions
export const trackExitIntentShown = (personaKey: PersonaId | 'default_exit' | 'unknown') => {
  // In a real app, this would send data to an analytics service
  console.log('Exit intent shown for persona:', personaKey);
};

export const trackExitIntentConversion = (personaContext: string, email: string) => {
  logInteractionWithEngagement('exit_intent_conversion', { persona_context: personaContext, email_captured: true, email: email });
  trackEmailSubmittedToPlatform(email, 'Exit Intent Popup');
};

export const trackEmailSubmittedToPlatform = (email: string | undefined, source: string) => {
  if (!email) return;
  console.log(`Integration: Email ${email} submitted from ${source} to Email Platform (e.g., ConvertKit/Mailchimp)`);
  useVisitorStore.getState().setEmailSubscriberStatus(true); // This will trigger 'identified_as_subscriber'
};

export const trackLeadToCRM = (email: string | undefined, persona: string | undefined, details: any) => {
  if (!email) return;
  console.log(`Integration: Lead ${email} (Persona: ${persona}) data sent to CRM`, details);
};

export const trackScrollDepth = (page: string, depthPercentage: number) => {
  logInteractionWithEngagement('scroll_depth', { page_identifier: page, scroll_percentage: depthPercentage });
};

export const trackVideoView = (videoId: string, eventType: 'start' | 'progress' | 'complete', progressPercent?: number) => {
  let eventName: BehavioralTrackingEventName = 'video_view_start';
  if (eventType === 'progress' && progressPercent) {
    if (progressPercent >= 75) eventName = 'video_milestone_75';
    else if (progressPercent >= 50) eventName = 'video_milestone_50';
    else if (progressPercent >= 25) eventName = 'video_milestone_25';
  } else if (eventType === 'complete') {
    eventName = 'video_completed';
  }
  logInteractionWithEngagement(eventName, { video_id: videoId, video_event_type: eventType, video_progress_percent: progressPercent });
};

export const trackToolUsage = (toolName: string, eventType: 'started' | 'completed' | 'abandoned_step_X', personaContext?: string, details?: any) => {
  let eventFullKey: BehavioralTrackingEventName | string = `tool_usage_${eventType}`;
  if (eventType === 'completed') eventFullKey = 'tool_usage_completed';
  logInteractionWithEngagement(eventFullKey, { tool_name: toolName, persona_context: personaContext, ...details });
};

export const trackPricingPageInteraction = (serviceName: string, timeSpentSeconds: number, hasClickedCTA: boolean) => {
  let eventName: BehavioralTrackingEventName = 'pricing_page_view_brief';
  if (hasClickedCTA) {
    eventName = 'pricing_page_cta_click';
  } else if (timeSpentSeconds > 30) { // Example threshold for extended view
    eventName = 'pricing_page_view_extended';
  }
  logInteractionWithEngagement(eventName, { service_name: serviceName, time_spent_seconds: timeSpentSeconds, clicked_cta: hasClickedCTA });
};

export const trackResourceDownload = (resourceName: string, emailProvided?: boolean) => {
  const eventName: BehavioralTrackingEventName = emailProvided ? 'resource_downloaded_with_email' : 'resource_downloaded_no_email';
  logInteractionWithEngagement(eventName, { resource_name: resourceName, email_provided: !!emailProvided });
  if (emailProvided) {
      // Assuming email is captured elsewhere and then this event is fired.
      // For direct email capture with resource, ensure email is passed.
      // trackEmailSubmittedToPlatform(email, `Resource Download: ${resourceName}`);
  }
};

export const trackServiceInquiryEvent = (eventName:'service_inquiry_started' | 'service_inquiry_abandoned_step_X' | 'service_inquiry_completed', details: any) => {
  logInteractionWithEngagement(eventName, details);
  const visitorStore = useVisitorStore.getState();
  if(eventName === 'service_inquiry_started') visitorStore.setServiceInquiryState('started');
  if(eventName === 'service_inquiry_completed') visitorStore.setServiceInquiryState('submitted');
};


export const trackCalendarBookingVisit = () => {
  logInteractionWithEngagement('calendar_page_visit', {});
};

export const trackCalendarBookingMade = (details?: any) => {
    logInteractionWithEngagement('calendar_booking_made', details);
    useVisitorStore.getState().setServiceInquiryState('consult_booked');
};

export const trackPageAbandonment = (pageIdentifier: string, timeOnPageSeconds: number, details?: Record<string, any>) => {
  logInteractionWithEngagement('page_abandonment', { page_identifier: pageIdentifier, time_on_page_seconds: timeOnPageSeconds, ...details });
};

export const trackToolAbandonment = (toolName: string, lastStepCompleted: string, personaContext?: string, details?: Record<string, any>) => {
  logInteractionWithEngagement('tool_usage_abandonment', { tool_name: toolName, last_step_completed: lastStepCompleted, persona_context: personaContext, ...details });
};