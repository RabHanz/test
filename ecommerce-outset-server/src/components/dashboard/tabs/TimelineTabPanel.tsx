import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { IntegrationTimelineEvent } from '../../types/integration';

interface TimelineTabPanelProps {
  events: IntegrationTimelineEvent[];
}

export const TimelineTabPanel: React.FC<TimelineTabPanelProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
        return <AddIcon color="success" />;
      case 'UPDATED':
        return <EditIcon color="info" />;
      case 'DELETED':
        return <DeleteIcon color="error" />;
      case 'STATUS_CHANGED':
        return <CheckCircleIcon color="success" />;
      case 'ERROR':
        return <ErrorIcon color="error" />;
      case 'WARNING':
        return <WarningIcon color="warning" />;
      case 'INFO':
        return <InfoIcon color="info" />;
      case 'SCHEDULED':
        return <ScheduleIcon color="info" />;
      case 'CODE_CHANGED':
        return <CodeIcon color="primary" />;
      case 'SECURITY_CHANGED':
        return <SecurityIcon color="warning" />;
      case 'CONFIG_CHANGED':
        return <SettingsIcon color="info" />;
      case 'BUG_FIXED':
        return <BugReportIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'CREATED':
      case 'STATUS_CHANGED':
      case 'BUG_FIXED':
        return 'success';
      case 'UPDATED':
      case 'INFO':
      case 'SCHEDULED':
      case 'CONFIG_CHANGED':
        return 'info';
      case 'WARNING':
      case 'SECURITY_CHANGED':
        return 'warning';
      case 'DELETED':
      case 'ERROR':
        return 'error';
      case 'CODE_CHANGED':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const groupEventsByDate = (events: IntegrationTimelineEvent[]) => {
    const groups: { [key: string]: IntegrationTimelineEvent[] } = {};
    events.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return groups;
  };

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const groupedEvents = groupEventsByDate(sortedEvents);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Timeline
        </Typography>

        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <Box key={date} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
              {date}
            </Typography>
            <List>
              {dateEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  {index > 0 && <Divider variant="inset" component="li" />}
                  <ListItem>
                    <ListItemIcon>{getEventIcon(event.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{event.title}</Typography>
                          <Chip
                            label={event.type}
                            color={getEventTypeColor(event.type) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatTimestamp(event.timestamp)}
                          </Typography>
                          {event.metadata && (
                            <Box sx={{ mt: 1 }}>
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}

        {events.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center">
            No timeline events available
          </Typography>
        )}
      </Paper>
    </Box>
  );
}; 