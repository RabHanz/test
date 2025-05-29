import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  UserContext,
  ContentRecommendation,
  ServiceRecommendation,
  PersonalizationResult,
} from '../types/personalization';

interface PersonalizationContextType {
  context: UserContext;
  recommendations: {
    content: ContentRecommendation[];
    service: ServiceRecommendation[];
  };
  actions: PersonalizationResult['actions'];
  updateContext: (updates: Partial<UserContext>) => void;
  trackInteraction: (type: 'content' | 'service', id: string, action: string) => void;
  resetContext: () => void;
}

export const PersonalizationContext = createContext<PersonalizationContextType | null>(null);

const STORAGE_KEY = 'personalization_context';

const getInitialContext = (): UserContext => {
  if (typeof window === 'undefined') {
    return {
      engagementLevel: 'low',
      deviceType: 'desktop',
      visitorType: 'new',
      sessionCount: 0,
      contentInteractions: [],
      serviceInteractions: [],
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    engagementLevel: 'low',
    deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    visitorType: 'new',
    sessionCount: 1,
    contentInteractions: [],
    serviceInteractions: [],
  };
};

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [context, setContext] = useState<UserContext>(getInitialContext);
  const [recommendations, setRecommendations] = useState<{
    content: ContentRecommendation[];
    service: ServiceRecommendation[];
  }>({ content: [], service: [] });
  const [actions, setActions] = useState<PersonalizationResult['actions']>([]);

  // Update context in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [context]);

  // Track page views and update context
  useEffect(() => {
    const trackPageView = async () => {
      const path = router.asPath;
      await trackInteraction('content', path, 'view');
    };

    trackPageView();
  }, [router.asPath]);

  // Update recommendations when context changes
  useEffect(() => {
    const updateRecommendations = async () => {
      try {
        const [contentRes, serviceRes] = await Promise.all([
          fetch('/api/personalization/content-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(context),
          }),
          fetch('/api/personalization/service-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(context),
          }),
        ]);

        const [contentData, serviceData] = await Promise.all([
          contentRes.json(),
          serviceRes.json(),
        ]);

        setRecommendations({
          content: contentData.recommendations,
          service: serviceData.recommendations,
        });
      } catch (error) {
        console.error('Error updating recommendations:', error);
      }
    };

    updateRecommendations();
  }, [context]);

  // Update actions when context changes
  useEffect(() => {
    const updateActions = async () => {
      try {
        const res = await fetch('/api/personalization/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(context),
        });

        const data = await res.json();
        setActions(data.actions);
      } catch (error) {
        console.error('Error updating actions:', error);
      }
    };

    updateActions();
  }, [context]);

  const updateContext = useCallback((updates: Partial<UserContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const trackInteraction = useCallback(async (type: 'content' | 'service', id: string, action: string) => {
    const interaction = {
      [type === 'content' ? 'contentId' : 'serviceId']: id,
      type: action,
      timestamp: new Date(),
    };

    setContext(prev => ({
      ...prev,
      [type === 'content' ? 'contentInteractions' : 'serviceInteractions']: [
        ...prev[type === 'content' ? 'contentInteractions' : 'serviceInteractions'],
        interaction,
      ],
    }));

    // Send interaction to analytics
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          action,
          context,
        }),
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [context]);

  const resetContext = useCallback(() => {
    setContext(getInitialContext());
    setRecommendations({ content: [], service: [] });
    setActions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PersonalizationContext.Provider
      value={{
        context,
        recommendations,
        actions,
        updateContext,
        trackInteraction,
        resetContext,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}; 