import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, Breadcrumbs, Link, Button, TextField, MenuItem, useTheme, useMediaQuery, Stack } from '@mui/material';
import { PersonaType } from '../../../types/optimizationHub';
import { ResourceLibrary } from '../../../components/resources/ResourceLibrary';
import { ProgressTracker } from '../../../components/resources/ProgressTracker';
import { LeadCapture } from '../../../components/blog/LeadCapture';
import { TemplatePreview } from '../../../components/resources/TemplatePreview';
import { analyticsService } from '../../../services/analytics';
import { useRouter } from 'next/router';
import { ResourceFacetedSearch, ResourceFilters } from '../../../components/resources/ResourceFacetedSearch';
import { ResourceMetadata } from '../../../config/resourceClassification';
import { ResourceRecommendationService } from '../../../services/resourceRecommendation';
import { RecommendedResources } from '../../../components/resources/RecommendedResources';
import { userBehaviorTrackingService } from '../../../services/userBehaviorTracking';
import { RecommendationFeedback } from '../../../components/resources/RecommendationFeedback';
import { RecommendationAnalytics } from '../../../components/resources/RecommendationAnalytics';
import { useAuth } from '../../../contexts/AuthContext';
import { ResourceSearch, SearchFilters } from '../../../components/resources/ResourceSearch';
import { ResourceCategories } from '../../../components/resources/ResourceCategories';
import { ResourcePreview } from '../../../components/resources/ResourcePreview';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'video' | 'case-study';
  category: string;
  personaTypes: PersonaType[];
  downloadUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  progress?: number;
  previewUrl?: string;
  fileType?: 'excel' | 'pdf' | 'doc';
}

const mockResources: ResourceMetadata[] = [
  {
    id: '1',
    title: 'Product Research Template',
    description: 'Comprehensive template for product research and validation',
    category: 'product-research',
    format: 'template',
    experienceLevel: 'beginner',
    tags: ['research', 'validation', 'template'],
    thumbnailUrl: '/images/resources/product-research.jpg',
    fileSize: 1024,
    lastUpdated: new Date('2024-01-15'),
    author: 'John Doe',
    downloads: 150,
    views: 300,
    rating: 4.5,
    personaTypes: ['STARTER', 'GROWTH'],
  },
  {
    id: '2',
    title: 'PPC Campaign Optimization Guide',
    description: 'Step-by-step guide for optimizing your PPC campaigns',
    category: 'ppc-optimization',
    format: 'guide',
    experienceLevel: 'intermediate',
    tags: ['ppc', 'optimization', 'guide'],
    thumbnailUrl: '/images/resources/ppc-guide.jpg',
    duration: 45,
    lastUpdated: new Date('2024-01-10'),
    author: 'Jane Smith',
    views: 200,
    rating: 4.8,
    personaTypes: ['GROWTH', 'ENTERPRISE'],
  },
  {
    id: '3',
    title: 'Case Study: Scaling to $1M',
    description: 'Real-world case study of scaling an Amazon business',
    category: 'business-growth',
    format: 'case-study',
    experienceLevel: 'advanced',
    tags: ['scaling', 'case-study', 'growth'],
    thumbnailUrl: '/images/resources/scaling-case-study.jpg',
    lastUpdated: new Date('2024-01-05'),
    author: 'Mike Johnson',
    views: 150,
    rating: 4.7,
    personaTypes: ['ENTERPRISE'],
  },
];

// Mock progress data
const mockProgress = {
  completedResources: [
    {
      resourceId: '1',
      title: 'Product Research Template',
      type: 'template',
      progress: 100,
      completed: true,
      lastAccessed: '2 days ago',
    },
  ],
  inProgressResources: [
    {
      resourceId: '2',
      title: 'PPC Campaign Optimization Guide',
      type: 'video',
      progress: 45,
      completed: false,
    },
  ],
  recommendedResources: [
    {
      resourceId: '3',
      title: 'Case Study: Scaling to $1M',
      type: 'case-study',
      progress: 0,
      completed: false,
    },
  ],
  overallProgress: 35,
};

const ResourceLibraryPage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Resource | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    categories: [],
    formats: [],
    experienceLevels: [],
    personaTypes: [],
    ratingRange: [0, 5],
    durationRange: [0, 120],
  });
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const recommendationService = new ResourceRecommendationService(mockResources);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedResourceForFeedback, setSelectedResourceForFeedback] = useState<ResourceMetadata | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
    format: [],
    experienceLevel: [],
    duration: [0, 120],
    rating: [0, 5],
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (isAuthenticated && selectedPersona) {
      // Get user behavior from tracking service
      const userBehavior = userBehaviorTrackingService.getUserBehavior('current-user');
      
      const lastViewedCategories = Array.from(
        new Set(
          userBehavior
            .filter((event) => event.eventType === 'view')
            .map((event) => event.metadata?.category)
            .filter(Boolean)
        )
      ) as string[];

      const preferredFormats = Array.from(
        new Set(
          userBehavior
            .filter((event) => event.eventType === 'download')
            .map((event) => event.metadata?.format)
            .filter(Boolean)
        )
      ) as string[];

      const completedResources = userBehavior
        .filter((event) => event.eventType === 'complete')
        .map((event) => event.resourceId);

      const recommendations = recommendationService.getRecommendations({
        viewedResources: userBehavior
          .filter((event) => event.eventType === 'view')
          .map((event) => event.resourceId),
        downloadedResources: userBehavior
          .filter((event) => event.eventType === 'download')
          .map((event) => event.resourceId),
        completedResources,
        lastViewedCategories,
        preferredFormats,
        personaType: selectedPersona,
      });

      setRecommendations(recommendations);
    }
  }, [isAuthenticated, selectedPersona]);

  const handleLeadCapture = async (email: string) => {
    try {
      // Here you would typically make an API call to verify the email
      await analyticsService.trackLeadCapture(email, 'resource-library');
      setIsAuthenticated(true);
      setShowLeadCapture(false);
    } catch (error) {
      console.error('Error capturing lead:', error);
    }
  };

  const handleResourceClick = async (resource: Resource) => {
    if (!isAuthenticated) {
      setShowLeadCapture(true);
      return;
    }

    setSelectedResource(resource);
    analyticsService.trackResourceView(resource.id, resource.type);
  };

  const handleClosePreview = () => {
    setSelectedResource(null);
  };

  const handleDownload = async () => {
    if (!selectedResource) return;
    
    try {
      // Implement actual download logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated download
      analyticsService.trackResourceDownload(selectedResource.id);
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const handleFilterChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters);
  };

  const handleFeedbackClick = (resource: ResourceMetadata) => {
    setSelectedResourceForFeedback(resource);
    setShowFeedback(true);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    // Implement search logic here
    analyticsService.trackResourceSearch(filters);
  };

  const handleClearSearch = () => {
    setSearchFilters({
      query: '',
      sortBy: 'relevance',
      format: [],
      experienceLevel: [],
      duration: [0, 120],
      rating: [0, 5],
    });
  };

  const filteredResources = mockResources.filter((resource) => {
    // Search filter
    if (
      filters.search &&
      !resource.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !resource.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(resource.category)
    ) {
      return false;
    }

    // Format filter
    if (filters.formats.length > 0 && !filters.formats.includes(resource.format)) {
      return false;
    }

    // Experience level filter
    if (
      filters.experienceLevels.length > 0 &&
      !filters.experienceLevels.includes(resource.experienceLevel)
    ) {
      return false;
    }

    // Rating filter
    if (
      resource.rating &&
      (resource.rating < filters.ratingRange[0] ||
        resource.rating > filters.ratingRange[1])
    ) {
      return false;
    }

    // Duration filter
    if (
      resource.duration &&
      (resource.duration < filters.durationRange[0] ||
        resource.duration > filters.durationRange[1])
    ) {
      return false;
    }

    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link href="/" color="inherit">
          Home
        </Link>
        <Link href="/resources" color="inherit">
          Resources
        </Link>
        <Typography color="text.primary">Resource Library</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <ResourceCategories
              onCategorySelect={(category) => {
                // Handle category selection
              }}
            />
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 4 }}>
            <ResourceSearch
              onSearch={handleSearch}
              onClear={handleClearSearch}
              initialFilters={searchFilters}
            />
          </Box>

          <ResourceLibrary
            resources={filteredResources}
            onResourceClick={handleResourceClick}
            filters={searchFilters}
          />
        </Grid>
      </Grid>

      {/* Resource Preview */}
      {selectedResource && (
        <ResourcePreview
          resource={{
            id: selectedResource.id,
            title: selectedResource.title,
            description: selectedResource.description,
            type: selectedResource.type === 'template' ? 'pdf' : 
                  selectedResource.type === 'video' ? 'video' : 'document',
            url: selectedResource.previewUrl,
            thumbnailUrl: selectedResource.thumbnailUrl,
            duration: selectedResource.duration ? parseInt(selectedResource.duration) : undefined,
          }}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      )}

      {/* Lead Capture Dialog */}
      {showLeadCapture && (
        <Paper sx={{ p: 4, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <Paper sx={{ p: 4, backgroundColor: 'white', maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Unlock Access to Premium Resources
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Enter your email to access our complete resource library, including:
            </Typography>
            <Box component="ul" sx={{ textAlign: 'left', mb: 3 }}>
              <li>Downloadable templates by persona</li>
              <li>Video tutorials and case studies</li>
              <li>Progress tracking and recommendations</li>
            </Box>
            <LeadCapture
              onSuccess={() => handleLeadCapture}
              category="resource-library"
            />
          </Paper>
        </Paper>
      )}

      {/* Feedback Dialog */}
      {showFeedback && selectedResourceForFeedback && (
        <Paper
          sx={{
            p: 4,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RecommendationFeedback
            resource={selectedResourceForFeedback}
            userId="current-user"
            onClose={() => {
              setShowFeedback(false);
              setSelectedResourceForFeedback(null);
            }}
          />
        </Paper>
      )}
    </Container>
  );
};

export default ResourceLibraryPage; 