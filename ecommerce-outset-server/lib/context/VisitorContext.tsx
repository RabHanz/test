'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useVisitorStore } from '@/lib/store/visitorStore';

interface VisitorContextType {
  determinedPersonaId: string | null;
  engagementLevel: 'low' | 'medium' | 'high';
  isEmailSubscriber: boolean;
  logInteraction: (action: string, data?: Record<string, any>) => void;
  setEmailSubscriberStatus: (status: boolean) => void;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const {
    determinedPersonaId,
    engagementLevel,
    isEmailSubscriber,
    logInteraction,
    setEmailSubscriberStatus,
  } = useVisitorStore();

  // Initialize visitor tracking
  useEffect(() => {
    // In a real app, this would check for existing visitor data
    // and potentially fetch from an API
    logInteraction('page_view', { path: window.location.pathname });
  }, [logInteraction]);

  return (
    <VisitorContext.Provider
      value={{
        determinedPersonaId,
        engagementLevel,
        isEmailSubscriber,
        logInteraction,
        setEmailSubscriberStatus,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitor must be used within a VisitorProvider');
  }
  return context;
} 