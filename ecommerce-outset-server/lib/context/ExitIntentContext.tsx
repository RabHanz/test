'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PersonaId } from '@/types';
import { PERSONA_SPECIFIC_EXIT_CONTENT } from '@/constants';
import { trackExitIntentShown } from '@/utils/trackingUtils';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { useVisitorStore } from '@/lib/store/visitorStore';

interface ExitIntentContextType {
  showExitIntent: boolean;
  setShowExitIntent: (show: boolean) => void;
  handleExitIntentSubmit: (email: string) => void;
}

const ExitIntentContext = createContext<ExitIntentContextType | undefined>(undefined);

export function ExitIntentProvider({ children }: { children: React.ReactNode }) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const { determinedPersonaId, logInteraction, setEmailSubscriberStatus } = useVisitorStore();

  // Determine exit intent content
  const exitIntentPersonaKey: PersonaId | 'default_exit' | 'unknown' = determinedPersonaId || 'default_exit';
  const exitContent = PERSONA_SPECIFIC_EXIT_CONTENT[exitIntentPersonaKey] || PERSONA_SPECIFIC_EXIT_CONTENT.default_exit;

  // Exit-intent logic
  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      if (showExitIntent) return; // Prevent re-trigger if already shown
      
      // Basic exit intent: mouse leaves top of viewport or document body
      if (e.clientY <= 0 || (e.relatedTarget == null && e.target !== document.body)) {
        const hasBeenShown = sessionStorage.getItem('exitIntentShown');
        if (!hasBeenShown) {
          setShowExitIntent(true);
          sessionStorage.setItem('exitIntentShown', 'true');
          trackExitIntentShown(exitIntentPersonaKey);
        }
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, [showExitIntent, exitIntentPersonaKey]);

  const handleExitIntentSubmit = (email: string) => {
    logInteraction('exit_intent_conversion', { email_captured: true, persona_context: exitIntentPersonaKey });
    setEmailSubscriberStatus(true);
    setShowExitIntent(false);
    alert(`Thanks for subscribing, ${email}! (Placeholder - from exit intent)`);
  };

  return (
    <ExitIntentContext.Provider value={{ showExitIntent, setShowExitIntent, handleExitIntentSubmit }}>
      {children}
      {showExitIntent && (
        <ExitIntentPopup
          content={exitContent}
          onClose={() => setShowExitIntent(false)}
          onSubmit={handleExitIntentSubmit}
        />
      )}
    </ExitIntentContext.Provider>
  );
}

export function useExitIntent() {
  const context = useContext(ExitIntentContext);
  if (context === undefined) {
    throw new Error('useExitIntent must be used within an ExitIntentProvider');
  }
  return context;
} 