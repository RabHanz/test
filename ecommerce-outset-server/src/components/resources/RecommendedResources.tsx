import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { ResourceMetadata } from '../../config/resourceClassification';
import { RecommendationScore } from '../../services/resourceRecommendation';

interface RecommendedResourcesProps {
  recommendations: RecommendationScore[];
  onResourceClick: (resource: ResourceMetadata) => void;
}

const formatScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

const getResourceIcon = (format: string) => {
  switch (format) {
    case 'video':
      return <PlayIcon />;
    case 'template':
      return <DescriptionIcon />;
    case 'case-study':
      return <AssessmentIcon />;
    default:
      return <DescriptionIcon />;
  }
};

export const RecommendedResources: React.FC<RecommendedResourcesProps> = ({
  recommendations,
  onResourceClick,
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StarIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Recommended for You</Typography>
      </Box>

      <List>
        {recommendations.map(({ resource, score, reasons }) => (
          <ListItem
            key={resource.id}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => onResourceClick(resource)}
          >
            <ListItemIcon>{getResourceIcon(resource.format)}</ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {resource.title}
                  <Chip
                    size="small"
                    label={formatScore(score)}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {resource.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {reasons.map((reason, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={reason}
                        variant="outlined"
                        icon={<InfoIcon fontSize="small" />}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 