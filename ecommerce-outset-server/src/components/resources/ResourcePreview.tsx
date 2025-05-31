import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { VideoPlayer } from './VideoPlayer';

interface ResourcePreviewProps {
  resource: {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'document' | 'spreadsheet';
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    fileSize?: number;
  };
  onClose: () => void;
  onDownload: () => void;
}

export const ResourcePreview: React.FC<ResourcePreviewProps> = ({
  resource,
  onClose,
  onDownload,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Reset zoom when resource changes
    setZoom(100);
  }, [resource.id]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (error: Error) => {
    setError(error.message);
    setLoading(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 50), 200));
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    switch (resource.type) {
      case 'pdf':
        return (
          <iframe
            src={resource.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: '0 0',
            }}
            onLoad={handleLoad}
            onError={() => handleError(new Error('Failed to load PDF'))}
          />
        );
      case 'video':
        return (
          <VideoPlayer
            url={resource.url}
            thumbnailUrl={resource.thumbnailUrl}
            onLoad={handleLoad}
            onError={handleError}
          />
        );
      case 'document':
      case 'spreadsheet':
        return (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Preview not available
            </Typography>
            <Typography variant="body2">
              This type of document can only be downloaded and viewed in the
              appropriate application.
            </Typography>
          </Box>
        );
      default:
        return (
          <Alert severity="warning" sx={{ m: 2 }}>
            Unsupported resource type
          </Alert>
        );
    }
  };

  const renderInfo = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {resource.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {resource.description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Details
        </Typography>
        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
          <li>Type: {resource.type.toUpperCase()}</li>
          {resource.duration && <li>Duration: {resource.duration} minutes</li>}
          {resource.fileSize && (
            <li>File Size: {(resource.fileSize / 1024 / 1024).toFixed(2)} MB</li>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" noWrap>
          {resource.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {resource.type === 'pdf' && (
            <>
              <Tooltip title="Zoom Out">
                <IconButton
                  size="small"
                  onClick={() => handleZoom(-10)}
                  disabled={zoom <= 50}
                >
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton
                  size="small"
                  onClick={() => handleZoom(10)}
                  disabled={zoom >= 200}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={onDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Preview" value="preview" />
        <Tab label="Info" value="info" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        {activeTab === 'preview' ? renderPreview() : renderInfo()}
      </Box>
    </Paper>
  );
}; 