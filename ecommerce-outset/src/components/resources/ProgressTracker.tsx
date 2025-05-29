import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { PersonaType } from '../../types/optimizationHub';

interface ResourceProgress {
  resourceId: string;
  title: string;
  type: 'template' | 'video' | 'case-study';
  progress: number;
  completed: boolean;
  lastAccessed?: string;
}

interface ProgressTrackerProps {
  personaType: PersonaType;
  completedResources: ResourceProgress[];
  inProgressResources: ResourceProgress[];
  recommendedResources: ResourceProgress[];
  overallProgress: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  personaType,
  completedResources,
  inProgressResources,
  recommendedResources,
  overallProgress,
}) => {
  const getPersonaColor = (persona: PersonaType) => {
    switch (persona) {
      case 'launch':
        return 'success';
      case 'scale':
        return 'primary';
      case 'master':
        return 'secondary';
      case 'connect':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'template':
        return <CheckCircleIcon color="success" />;
      case 'video':
        return <PlayCircleIcon color="primary" />;
      case 'case-study':
        return <StarIcon color="warning" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  return (
    <Box>
      {/* Overall Progress */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              color={getPersonaColor(personaType) as any}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {overallProgress}%
          </Typography>
        </Box>
      </Box>

      {/* In Progress Resources */}
      {inProgressResources.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Continue Learning
          </Typography>
          <List dense>
            {inProgressResources.map((resource) => (
              <ListItem key={resource.resourceId}>
                <ListItemIcon>{getResourceIcon(resource.type)}</ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={resource.progress}
                        sx={{ width: 100, height: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {resource.progress}%
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Completed Resources */}
      {completedResources.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Completed Resources
          </Typography>
          <List dense>
            {completedResources.map((resource) => (
              <ListItem key={resource.resourceId}>
                <ListItemIcon>{getResourceIcon(resource.type)}</ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={`Completed ${resource.lastAccessed}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Recommended Resources */}
      {recommendedResources.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recommended Next Steps
          </Typography>
          <List dense>
            {recommendedResources.map((resource) => (
              <ListItem key={resource.resourceId}>
                <ListItemIcon>
                  <TrendingUpIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={`Based on your ${personaType} profile`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}; 