import React from 'react';
import { usePersonalization } from '../hooks/usePersonalization';
import { InteractionType } from '../types/personalization';

interface PersonalizedUIProps {
  children: React.ReactNode;
}

export function PersonalizedUI({ children }: PersonalizedUIProps) {
  const {
    getPersonalizedUI,
    trackUserInteraction,
    context,
  } = usePersonalization();

  const ui = getPersonalizedUI();

  React.useEffect(() => {
    if (ui) {
      trackUserInteraction(InteractionType.UI_PREFERENCE_APPLIED, {
        uiPreferences: ui,
        persona: context.persona,
      });
    }
  }, [ui, context, trackUserInteraction]);

  if (!ui) {
    return <>{children}</>;
  }

  const style = {
    '--primary-color': ui.primaryColor,
    '--secondary-color': ui.secondaryColor,
    '--font-size': ui.fontSize,
    '--spacing': ui.spacing,
    '--border-radius': ui.borderRadius,
  } as React.CSSProperties;

  return (
    <div className="personalized-ui" style={style}>
      {children}
    </div>
  );
} 