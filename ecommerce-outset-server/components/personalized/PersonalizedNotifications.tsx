import React, { useEffect, useState } from 'react';
import { Notification } from '../../types/notifications';
import { NotificationService } from '../../services/notification';
import { useUserStore } from '../../store/userStore';

interface PersonalizedNotificationsProps {
  maxNotifications?: number;
  showUnreadOnly?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export const PersonalizedNotifications: React.FC<PersonalizedNotificationsProps> = ({
  maxNotifications = 5,
  showUnreadOnly = false,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const service = new NotificationService();
        const fetchedNotifications = await service.getUserNotifications({
          userId: user.id,
          maxCount: maxNotifications,
          unreadOnly: showUnreadOnly
        });
        setNotifications(fetchedNotifications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, maxNotifications, showUnreadOnly]);

  const handleNotificationClick = async (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    if (!notification.read) {
      try {
        const service = new NotificationService();
        await service.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  if (isLoading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="notifications-empty">No notifications to display</div>;
  }

  return (
    <div className="personalized-notifications">
      <h2 className="notifications-title">Your Notifications</h2>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-icon">
              {notification.icon}
            </div>
            <div className="notification-content">
              <h3 className="notification-title">{notification.title}</h3>
              <p className="notification-message">{notification.message}</p>
              <div className="notification-meta">
                <span className="notification-time">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
                {notification.category && (
                  <span className="notification-category">
                    {notification.category}
                  </span>
                )}
              </div>
            </div>
            {!notification.read && (
              <div className="notification-badge" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 