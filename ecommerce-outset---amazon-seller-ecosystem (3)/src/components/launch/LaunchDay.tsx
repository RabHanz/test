import React, { useState } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button, Grid, Col } from '@tremor/react';
import { FiCheck, FiAlertCircle, FiRefreshCw, FiUsers, FiMessageSquare, FiBell } from 'react-icons/fi';

interface TeamMember {
  id: string;
  role: string;
  name: string;
  status: 'ready' | 'busy' | 'unavailable';
  currentTask?: string;
}

interface Communication {
  id: string;
  type: 'internal' | 'customer' | 'partner' | 'media' | 'social' | 'community';
  title: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledTime?: Date;
  sentTime?: Date;
  error?: string;
}

interface LaunchDayProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const LaunchDay: React.FC<LaunchDayProps> = ({ onStatusUpdate }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'tech-lead',
      role: 'Technical Lead',
      name: 'John Doe',
      status: 'ready'
    },
    {
      id: 'marketing-lead',
      role: 'Marketing Lead',
      name: 'Jane Smith',
      status: 'ready'
    },
    {
      id: 'customer-success',
      role: 'Customer Success Lead',
      name: 'Mike Johnson',
      status: 'ready'
    },
    {
      id: 'content-lead',
      role: 'Content Lead',
      name: 'Sarah Wilson',
      status: 'ready'
    },
    {
      id: 'analytics-lead',
      role: 'Analytics Lead',
      name: 'David Brown',
      status: 'ready'
    },
    {
      id: 'executive',
      role: 'Executive Oversight',
      name: 'Emily Davis',
      status: 'ready'
    }
  ]);

  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: 'internal-announcement',
      type: 'internal',
      title: 'Internal Team Launch Announcement',
      status: 'pending'
    },
    {
      id: 'customer-notification',
      type: 'customer',
      title: 'Customer Launch Notification',
      status: 'pending'
    },
    {
      id: 'partner-update',
      type: 'partner',
      title: 'Partner and Affiliate Update',
      status: 'pending'
    },
    {
      id: 'media-release',
      type: 'media',
      title: 'Press Release Distribution',
      status: 'pending'
    },
    {
      id: 'social-campaign',
      type: 'social',
      title: 'Social Media Launch Campaign',
      status: 'pending'
    },
    {
      id: 'community-announcement',
      type: 'community',
      title: 'Community Launch Celebration',
      status: 'pending'
    }
  ]);

  const updateTeamStatus = (id: string, status: TeamMember['status'], currentTask?: string) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id
          ? { ...member, status, currentTask }
          : member
      )
    );

    // Update overall launch day status
    const allReady = teamMembers.every(member => member.status === 'ready');
    onStatusUpdate('launchDay', allReady);
  };

  const updateCommunicationStatus = (id: string, status: Communication['status'], error?: string) => {
    setCommunications(prev =>
      prev.map(comm =>
        comm.id === id
          ? {
              ...comm,
              status,
              sentTime: status === 'sent' ? new Date() : comm.sentTime,
              error
            }
          : comm
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      busy: { color: 'yellow', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      unavailable: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> },
      pending: { color: 'gray', icon: <FiAlertCircle className="w-4 h-4" /> },
      sent: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      failed: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCommunicationIcon = (type: Communication['type']) => {
    const iconConfig = {
      internal: <FiUsers className="w-5 h-5" />,
      customer: <FiUsers className="w-5 h-5" />,
      partner: <FiUsers className="w-5 h-5" />,
      media: <FiMessageSquare className="w-5 h-5" />,
      social: <FiMessageSquare className="w-5 h-5" />,
      community: <FiBell className="w-5 h-5" />
    };

    return iconConfig[type];
  };

  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        {teamMembers.map(member => (
          <Col key={member.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Text className="font-medium">{member.role}</Text>
                {getStatusBadge(member.status)}
              </div>
              <Text>{member.name}</Text>
              {member.currentTask && (
                <Text className="text-sm text-gray-500 mt-1">
                  Current Task: {member.currentTask}
                </Text>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => updateTeamStatus(member.id, 'busy', 'Monitoring launch metrics')}
                >
                  Set Busy
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => updateTeamStatus(member.id, 'ready')}
                >
                  Set Ready
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>

      <Card className="p-6">
        <Title>Communication Plan</Title>
        <List className="mt-4">
          {communications.map(comm => (
            <ListItem key={comm.id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getCommunicationIcon(comm.type)}
                    <Text className="font-medium">{comm.title}</Text>
                  </div>
                  {comm.error && (
                    <Text className="text-red-500 mt-1">{comm.error}</Text>
                  )}
                  {comm.sentTime && (
                    <Text className="text-sm text-gray-400 mt-1">
                      Sent: {comm.sentTime.toLocaleString()}
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(comm.status)}
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => updateCommunicationStatus(comm.id, 'sent')}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </Card>
    </div>
  );
};

export default LaunchDay; 