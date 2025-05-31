import React from 'react';
import { usePersonalization } from '../hooks/usePersonalization';
import { InteractionType } from '../types/personalization';

interface PersonalizedNotificationsProps {
  maxNotifications?: number;
}

export function PersonalizedNotifications({
  maxNotifications = 3,
}: PersonalizedNotificationsProps) {
  const {
    getPersonalizedNotifications,
    trackUserInteraction,
    context,
  } = usePersonalization();

  const notifications = getPersonalizedNotifications().slice(0, maxNotifications);

  React.useEffect(() => {
    if (notifications.length > 0) {
      trackUserInteraction(InteractionType.NOTIFICATION_VIEW, {
        notificationIds: notifications.map((n) => n.id),
        persona: context.persona,
      });
    }
  }, [notifications, context, trackUserInteraction]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="personalized-notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() =>
            trackUserInteraction(InteractionType.NOTIFICATION_CLICK, {
              notificationId: notification.id,
              type: notification.type,
            })
          }
        >
          <div className="notification-icon">
            {notification.icon && <img src={notification.icon} alt="" />}
          </div>
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            {notification.action && (
              <button
                className="notification-action"
                onClick={(e) => {
                  e.stopPropagation();
                  trackUserInteraction(InteractionType.NOTIFICATION_ACTION, {
                    notificationId: notification.id,
                    action: notification.action.type,
                  });
                }}
              >
                {notification.action.text}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 