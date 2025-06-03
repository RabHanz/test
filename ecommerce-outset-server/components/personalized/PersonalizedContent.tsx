import React, { useEffect, useState } from 'react';
import { Content } from '../../types/content';
import { ContentService } from '../../services/content';
import { useUserStore } from '../../store/userStore';
import { usePreferencesStore } from '../../store/preferencesStore';

interface PersonalizedContentProps {
  contentType?: string;
  maxItems?: number;
  showMetadata?: boolean;
  onContentClick?: (content: Content) => void;
}

export const PersonalizedContent: React.FC<PersonalizedContentProps> = ({
  contentType,
  maxItems = 5,
  showMetadata = true,
  onContentClick
}) => {
  const [contentItems, setContentItems] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();

  useEffect(() => {
    const fetchContent = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const service = new ContentService();
        const fetchedContent = await service.getPersonalizedContent({
          userId: user.id,
          contentType,
          maxCount: maxItems,
          preferences: {
            preferredTopics: preferences.preferredTopics,
            excludedTopics: preferences.excludedTopics,
            contentFormat: preferences.contentFormat
          }
        });
        setContentItems(fetchedContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [user, contentType, maxItems, preferences]);

  if (isLoading) {
    return <div className="content-loading">Loading content...</div>;
  }

  if (error) {
    return <div className="content-error">Error: {error}</div>;
  }

  if (contentItems.length === 0) {
    return <div className="content-empty">No content to display</div>;
  }

  return (
    <div className="personalized-content">
      <h2 className="content-title">Recommended Content</h2>
      <div className="content-list">
        {contentItems.map(content => (
          <div
            key={content.id}
            className="content-card"
            onClick={() => onContentClick?.(content)}
          >
            <div className="content-header">
              <h3 className="content-title">{content.title}</h3>
              {showMetadata && (
                <div className="content-meta">
                  <span className="content-type">{content.type}</span>
                  <span className="content-date">
                    {new Date(content.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <p className="content-excerpt">{content.excerpt}</p>
            {showMetadata && (
              <div className="content-footer">
                <div className="content-tags">
                  {content.tags.map(tag => (
                    <span key={tag} className="content-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
                {content.author && (
                  <span className="content-author">
                    By {content.author}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 