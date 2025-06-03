import React, { useEffect, useState } from 'react';
import { FacebookGroupPost, GroupContent, GroupEvent } from '../../types/facebook-integration';
import { FacebookIntegrationService } from '../../services/facebook-integration';

interface FacebookGroupIntegrationProps {
  personaType?: string;
  showLatestPosts?: boolean;
  showFeaturedDiscussions?: boolean;
  showEvents?: boolean;
  maxPosts?: number;
  maxDiscussions?: number;
  maxEvents?: number;
}

export const FacebookGroupIntegration: React.FC<FacebookGroupIntegrationProps> = ({
  personaType,
  showLatestPosts = true,
  showFeaturedDiscussions = true,
  showEvents = true,
  maxPosts = 5,
  maxDiscussions = 3,
  maxEvents = 2
}) => {
  const [latestPosts, setLatestPosts] = useState<FacebookGroupPost[]>([]);
  const [featuredDiscussions, setFeaturedDiscussions] = useState<GroupContent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<GroupEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        const service = new FacebookIntegrationService({
          groupId: 'ecommerceoutset',
          accessToken: process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN || '',
          autoPostEnabled: true,
          contentSyncEnabled: true,
          memberTrackingEnabled: true,
          moderationEnabled: true
        });

        const [posts, discussions, events] = await Promise.all([
          showLatestPosts ? service.getLatestPosts(maxPosts) : Promise.resolve([]),
          showFeaturedDiscussions && personaType ? service.getFeaturedDiscussions(personaType) : Promise.resolve([]),
          showEvents ? service.getUpcomingEvents() : Promise.resolve([])
        ]);

        setLatestPosts(posts);
        setFeaturedDiscussions(discussions);
        setUpcomingEvents(events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load group data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [personaType, showLatestPosts, showFeaturedDiscussions, showEvents, maxPosts, maxDiscussions, maxEvents]);

  if (isLoading) {
    return <div className="facebook-group-loading">Loading group content...</div>;
  }

  if (error) {
    return <div className="facebook-group-error">Error: {error}</div>;
  }

  return (
    <div className="facebook-group-integration">
      {showLatestPosts && latestPosts.length > 0 && (
        <section className="latest-posts">
          <h2>Latest Group Posts</h2>
          <div className="posts-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="author">{post.from.name}</span>
                  <span className="date">{new Date(post.created_time).toLocaleDateString()}</span>
                </div>
                <p className="post-content">{post.message}</p>
                <div className="post-stats">
                  <span>👍 {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                </div>
                <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="view-post">
                  View on Facebook
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {showFeaturedDiscussions && featuredDiscussions.length > 0 && (
        <section className="featured-discussions">
          <h2>Featured Discussions</h2>
          <div className="discussions-grid">
            {featuredDiscussions.map(discussion => (
              <div key={discussion.id} className="discussion-card">
                <h3>{discussion.title}</h3>
                <p className="discussion-content">{discussion.content}</p>
                <div className="discussion-meta">
                  <span className="author">By {discussion.author}</span>
                  <div className="tags">
                    {discussion.personaTags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="discussion-stats">
                  <span>👍 {discussion.engagement.likes}</span>
                  <span>💬 {discussion.engagement.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showEvents && upcomingEvents.length > 0 && (
        <section className="upcoming-events">
          <h2>Upcoming Events</h2>
          <div className="events-grid">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <span className="date">
                    {new Date(event.startTime).toLocaleDateString()}
                  </span>
                  <span className="time">
                    {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                  </span>
                  <span className="type">{event.type}</span>
                </div>
                <div className="event-stats">
                  <span>👥 {event.attendees} attending</span>
                </div>
                <a href={event.groupUrl} target="_blank" rel="noopener noreferrer" className="view-event">
                  View Event
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="join-group-cta">
        <h3>Join Our Community</h3>
        <p>Connect with 14,348+ Amazon sellers in our Facebook group</p>
        <a
          href="https://www.facebook.com/groups/ecommerceoutset/"
          target="_blank"
          rel="noopener noreferrer"
          className="join-button"
        >
          Join the Group
        </a>
      </div>
    </div>
  );
}; 