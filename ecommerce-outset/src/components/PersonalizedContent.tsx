import React from 'react';
import { usePersonalization } from '../hooks/usePersonalization';
import { InteractionType } from '../types/personalization';

interface PersonalizedContentProps {
  contentId: string;
  fallbackContent: React.ReactNode;
}

export function PersonalizedContent({
  contentId,
  fallbackContent,
}: PersonalizedContentProps) {
  const {
    getPersonalizedContent,
    trackUserInteraction,
    context,
  } = usePersonalization();

  const personalizedContent = getPersonalizedContent(contentId);

  React.useEffect(() => {
    if (personalizedContent) {
      trackUserInteraction(InteractionType.CONTENT_VIEW, {
        contentId,
        persona: context.persona,
        engagementLevel: context.engagementLevel,
      });
    }
  }, [personalizedContent, contentId, context, trackUserInteraction]);

  if (!personalizedContent) {
    return <>{fallbackContent}</>;
  }

  return (
    <div className="personalized-content">
      <h2>{personalizedContent.title}</h2>
      <div
        className="content-body"
        dangerouslySetInnerHTML={{ __html: personalizedContent.content }}
      />
      {personalizedContent.cta && (
        <button
          className="cta-button"
          onClick={() =>
            trackUserInteraction(InteractionType.CTA_CLICK, {
              contentId,
              ctaId: personalizedContent.cta.id,
            })
          }
        >
          {personalizedContent.cta.text}
        </button>
      )}
    </div>
  );
} 