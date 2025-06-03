import React, { createContext, useContext, useEffect, useState } from 'react';
import { useVisitorStore } from '@/lib/store/visitorStore';
import type { PersonaId, EngagementLevel } from '@/types';

interface PersonalizationContextType {
  personalizedContent: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  refreshPersonalization: () => Promise<void>;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [personalizedContent, setPersonalizedContent] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { determinedPersonaId, engagementLevel } = useVisitorStore();

  const fetchPersonalizedContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would fetch from your personalization API
      const response = await fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: determinedPersonaId,
          engagementLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personalized content');
      }

      const data = await response.json();
      setPersonalizedContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalizedContent();
  }, [determinedPersonaId, engagementLevel]);

  const refreshPersonalization = async () => {
    await fetchPersonalizedContent();
  };

  return (
    <PersonalizationContext.Provider
      value={{
        personalizedContent,
        isLoading,
        error,
        refreshPersonalization,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
} 