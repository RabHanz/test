import React, { useState } from 'react';
import { Card, Title, Text, Grid, Col, List, ListItem, Badge, Button, TextInput, Textarea } from '@tremor/react';
import { FiMessageSquare, FiBell, FiSend, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

interface Message {
  id: string;
  type: 'announcement' | 'update' | 'alert' | 'reminder';
  title: string;
  content: string;
  sender: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'sent' | 'pending' | 'failed';
  recipients: string[];
  readBy: string[];
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface LaunchCommunicationProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const LaunchCommunication: React.FC<LaunchCommunicationProps> = ({ onStatusUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      type: 'announcement',
      title: 'Launch Phase 1 Complete',
      content: 'Successfully completed the first phase of the launch. All systems are operational.',
      sender: 'Launch Manager',
      timestamp: new Date('2024-03-10T10:00:00'),
      priority: 'high',
      status: 'sent',
      recipients: ['All Teams'],
      readBy: ['Tech Team', 'Product Team']
    },
    {
      id: 'msg-2',
      type: 'update',
      title: 'Performance Metrics Update',
      content: 'Current performance metrics are within expected ranges. No immediate action required.',
      sender: 'Monitoring Team',
      timestamp: new Date('2024-03-10T09:30:00'),
      priority: 'medium',
      status: 'sent',
      recipients: ['Tech Team', 'Product Team'],
      readBy: ['Tech Team']
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'success',
      message: 'Database backup completed successfully',
      timestamp: new Date('2024-03-10T10:15:00'),
      read: false
    },
    {
      id: 'notif-2',
      type: 'warning',
      message: 'High server load detected in region US-East',
      timestamp: new Date('2024-03-10T10:10:00'),
      read: false,
      action: {
        label: 'View Details',
        onClick: () => {
          // Handle action
        }
      }
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    type: 'announcement' as Message['type'],
    title: '',
    content: '',
    priority: 'medium' as Message['priority'],
    recipients: [] as string[]
  });

  const sendMessage = () => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      ...newMessage,
      sender: 'Current User',
      timestamp: new Date(),
      status: 'sent',
      readBy: []
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      type: 'announcement',
      title: '',
      content: '',
      priority: 'medium',
      recipients: []
    });

    // Update communication status
    const allSent = messages.every(msg => msg.status === 'sent');
    onStatusUpdate('launchCommunication', allSent);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getMessageTypeBadge = (type: Message['type']) => {
    const typeConfig = {
      announcement: { color: 'blue', icon: <FiBell className="w-4 h-4" /> },
      update: { color: 'green', icon: <FiMessageSquare className="w-4 h-4" /> },
      alert: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      reminder: { color: 'yellow', icon: <FiClock className="w-4 h-4" /> }
    };

    const config = typeConfig[type];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Message['priority']) => {
    const priorityConfig = {
      high: { color: 'red', text: 'High Priority' },
      medium: { color: 'yellow', text: 'Medium Priority' },
      low: { color: 'blue', text: 'Low Priority' }
    };

    const config = priorityConfig[priority];
    return (
      <Badge color={config.color as any} size="sm">
        {config.text}
      </Badge>
    );
  };

  const getNotificationBadge = (type: Notification['type']) => {
    const typeConfig = {
      success: { color: 'green', icon: <FiCheckCircle className="w-4 h-4" /> },
      warning: { color: 'yellow', icon: <FiAlertCircle className="w-4 h-4" /> },
      error: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      info: { color: 'blue', icon: <FiMessageSquare className="w-4 h-4" /> }
    };

    const config = typeConfig[type];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} className="gap-6">
        <Col>
          <Card className="p-6">
            <Title>Team Communication</Title>
            <div className="mt-4 space-y-4">
              <TextInput
                placeholder="Message Title"
                value={newMessage.title}
                onChange={e => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Message Content"
                value={newMessage.content}
                onChange={e => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setNewMessage(prev => ({ ...prev, type: 'announcement' }))}
                >
                  Announcement
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setNewMessage(prev => ({ ...prev, type: 'update' }))}
                >
                  Update
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setNewMessage(prev => ({ ...prev, type: 'alert' }))}
                >
                  Alert
                </Button>
              </div>
              <Button
                size="xs"
                variant="primary"
                onClick={sendMessage}
                disabled={!newMessage.title || !newMessage.content}
              >
                <FiSend className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </Card>
        </Col>
        <Col>
          <Card className="p-6">
            <Title>Recent Messages</Title>
            <List className="mt-4">
              {messages.map(message => (
                <ListItem key={message.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getMessageTypeBadge(message.type)}
                        <Text className="font-medium">{message.title}</Text>
                      </div>
                      <Text className="text-gray-500">{message.content}</Text>
                      <div className="mt-2">
                        <Text className="text-sm text-gray-500">
                          From: {message.sender}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          To: {message.recipients.join(', ')}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          {message.timestamp.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                    {getPriorityBadge(message.priority)}
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>
        </Col>
      </Grid>

      <Card className="p-6">
        <Title>Notifications</Title>
        <List className="mt-4">
          {notifications.map(notification => (
            <ListItem key={notification.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getNotificationBadge(notification.type)}
                    <Text className={notification.read ? 'text-gray-500' : 'font-medium'}>
                      {notification.message}
                    </Text>
                  </div>
                  <Text className="text-sm text-gray-400 mt-1">
                    {notification.timestamp.toLocaleString()}
                  </Text>
                </div>
                {notification.action && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={notification.action.onClick}
                  >
                    {notification.action.label}
                  </Button>
                )}
                {!notification.read && (
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </ListItem>
          ))}
        </List>
      </Card>
    </div>
  );
};

export default LaunchCommunication; 