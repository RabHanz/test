'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Make sure usePathname is imported
import {
  UserContext,
  ContentRecommendation,
  ServiceRecommendation,
  PersonalizationResult,
} from '../types/personalization'; // Adjust the import path for types if necessary

interface PersonalizationContextType {
  personaId: string | null;
  setPersonaId: (id: string | null) => void;
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

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

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
  } else {
     return {
      engagementLevel: 'low',
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      visitorType: 'new',
      sessionCount: 1,
      contentInteractions: [],
      serviceInteractions: [],
    };
  }
};

export const PersonalizationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [context, setContext] = useState<UserContext>(getInitialContext);
  const [recommendations, setRecommendations] = useState<{ // Corrected type annotation
    content: ContentRecommendation[];
    service: ServiceRecommendation[];
  }>({ content: [], service: [] });
  const [actions, setActions] = useState<PersonalizationResult['actions']>([]);

  // Define trackInteraction before the useEffect that uses it
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
  }, [context]); // context is a dependency because it's used in the fetch call


  // Update context in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [context]);

  // Track page views and update context
  useEffect(() => {
    const trackPageView = async () => {
      if (pathname) {
        await trackInteraction('content', pathname, 'view');
      }
    };

    trackPageView();
  }, [pathname, trackInteraction]);


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

  const resetContext = useCallback(() => {
    setContext(getInitialContext());
    setRecommendations({ content: [], service: [] });
    setActions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PersonalizationContext.Provider
      value={{
        personaId,
        setPersonaId,
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
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};