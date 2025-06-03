import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useContentGovernance } from '../../hooks/useContentGovernance';
import { ContentGovernance } from '../content/ContentGovernance';
import { IntegrationProject } from '../../types/integration';
import { ContentMetadata } from '../../services/contentGovernance';

interface ContentManagementDashboardProps {
  integration: IntegrationProject;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && <Box>{children}</Box>}
  </div>
);

const ContentManagementDashboard: React.FC<ContentManagementDashboardProps> = ({ integration }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentVersion,
    versions,
    isDraft,
    isReview,
    isApproved,
    isRejected,
    createContent,
    updateContent,
    submitForReview,
    approveContent,
    rejectContent,
    addComment,
  } = useContentGovernance();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateContent = () => {
    const metadata: ContentMetadata = {
      title: `${integration.name} Documentation`,
      category: 'integration-docs',
      tags: ['integration', integration.type, integration.protocol],
      lastModified: new Date(),
      created: new Date(),
      contentType: 'guide',
      targetAudience: ['developers', 'integration-managers'],
      seoKeywords: [integration.name, integration.type, integration.protocol],
    };

    createContent('', metadata);
    setIsContentDialogOpen(true);
  };

  const handleEditContent = (contentId: string) => {
    setSelectedContent(contentId);
    setIsContentDialogOpen(true);
  };

  const handleApproveContent = (contentId: string) => {
    approveContent('Content approved for integration documentation');
  };

  const handleRejectContent = (contentId: string) => {
    rejectContent('Content needs revision');
  };

  const renderContentList = () => {
    if (!versions) return null;

    return versions.map((version) => (
      <Paper key={version.id} sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="h6">{version.metadata.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Version {version.version} - {version.status}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit">
                <IconButton onClick={() => handleEditContent(version.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="History">
                <IconButton>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              {version.status === 'review' && (
                <>
                  <Tooltip title="Approve">
                    <IconButton onClick={() => handleApproveContent(version.id)}>
                      <ApproveIcon color="success" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton onClick={() => handleRejectContent(version.id)}>
                      <RejectIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 1 }}>
          {version.metadata.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ mr: 1 }} />
          ))}
        </Box>
      </Paper>
    ));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Documentation" />
          <Tab label="API Guides" />
          <Tab label="Troubleshooting" />
          <Tab label="Best Practices" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateContent}
          disabled={isLoading}
        >
          Create New Content
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TabPanel value={activeTab} index={0}>
          {renderContentList()}
        </TabPanel>
      )}

      {isContentDialogOpen && (
        <ContentGovernance
          contentId={selectedContent || ''}
          initialContent={currentVersion?.content || ''}
          onApprove={(content) => {
            approveContent('Content approved');
            setIsContentDialogOpen(false);
          }}
          onReject={(reason) => {
            rejectContent(reason);
            setIsContentDialogOpen(false);
          }}
          onUpdate={(content) => {
            updateContent(content);
            setIsContentDialogOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default ContentManagementDashboard; 