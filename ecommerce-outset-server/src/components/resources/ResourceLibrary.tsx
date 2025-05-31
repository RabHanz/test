import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { SearchFilters } from './ResourceSearch';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'video' | 'case-study';
  category: string;
  personaTypes: string[];
  downloadUrl: string;
  thumbnailUrl: string;
  duration?: string;
  previewUrl: string;
  fileType: string;
  rating?: number;
  views?: number;
  downloads?: number;
}

interface ResourceLibraryProps {
  resources: Resource[];
  onResourceClick: (resource: Resource) => void;
  filters: SearchFilters;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({
  resources,
  onResourceClick,
  filters,
}) => {
  const filterResources = (resources: Resource[]): Resource[] => {
    return resources.filter((resource) => {
      // Search query filter
      if (
        filters.query &&
        !resource.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !resource.description.toLowerCase().includes(filters.query.toLowerCase())
      ) {
        return false;
      }

      // Format filter
      if (filters.format.length > 0 && !filters.format.includes(resource.type)) {
        return false;
      }

      // Experience level filter (assuming it's stored in category)
      if (
        filters.experienceLevel.length > 0 &&
        !filters.experienceLevel.some((level) =>
          resource.category.toLowerCase().includes(level.toLowerCase())
        )
      ) {
        return false;
      }

      // Duration filter
      if (resource.duration) {
        const duration = parseInt(resource.duration);
        if (
          duration < filters.duration[0] ||
          duration > filters.duration[1]
        ) {
          return false;
        }
      }

      // Rating filter
      if (
        resource.rating &&
        (resource.rating < filters.rating[0] ||
          resource.rating > filters.rating[1])
      ) {
        return false;
      }

      return true;
    });
  };

  const sortResources = (resources: Resource[]): Resource[] => {
    return [...resources].sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          // Assuming there's a createdAt field, sort by date
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          // Relevance sorting (default)
          return 0;
      }
    });
  };

  const filteredAndSortedResources = sortResources(filterResources(resources));

  return (
    <Grid container spacing={3}>
      {filteredAndSortedResources.map((resource) => (
        <Grid item xs={12} sm={6} md={4} key={resource.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
              },
            }}
            onClick={() => onResourceClick(resource)}
          >
            <CardMedia
              component="img"
              height="140"
              image={resource.thumbnailUrl}
              alt={resource.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="h2">
                {resource.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {resource.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  size="small"
                  label={resource.type}
                  color="primary"
                  variant="outlined"
                />
                {resource.duration && (
                  <Chip
                    size="small"
                    icon={<TimeIcon />}
                    label={resource.duration}
                    variant="outlined"
                  />
                )}
                {resource.rating && (
                  <Chip
                    size="small"
                    icon={<StarIcon />}
                    label={resource.rating.toFixed(1)}
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
            <Box
              sx={{
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Tooltip title="Preview">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResourceClick(resource);
                  }}
                >
                  <PlayIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(resource.downloadUrl, '_blank');
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 