import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Preview as PreviewIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { analyticsService } from '../../services/analytics';

interface TemplatePreviewProps {
  templateUrl: string;
  title: string;
  description: string;
  resourceId: string;
  previewUrl?: string;
  fileType: 'excel' | 'pdf' | 'doc';
  onDownload: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateUrl,
  title,
  description,
  resourceId,
  previewUrl,
  fileType,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePreviewOpen = () => {
    setIsPreviewOpen(true);
    analyticsService.trackTemplatePreview(resourceId);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await onDownload();
      analyticsService.trackTemplateDownload(resourceId);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'grey.100',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Preview not available
          </Typography>
        </Box>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          />
        );
      case 'excel':
        return (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Excel preview not available. Please download to view.
            </Typography>
          </Box>
        );
      case 'doc':
        return (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Document preview not available. Please download to view.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Preview" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={isLoading}
              >
                {isLoading ? 'Downloading...' : 'Download Template'}
              </Button>
              {previewUrl && (
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreviewOpen}
                >
                  Preview
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            {previewUrl ? (
              <Box sx={{ position: 'relative' }}>
                {renderPreview()}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    p: 0.5,
                  }}
                >
                  <Tooltip title="Zoom Out">
                    <IconButton size="small" onClick={handleZoomOut}>
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom In">
                    <IconButton size="small" onClick={handleZoomIn}>
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Fullscreen">
                    <IconButton size="small" onClick={handleFullscreen}>
                      <FullscreenIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Preview not available for this template.
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Dialog
        open={isPreviewOpen}
        onClose={handlePreviewClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isFullscreen}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handlePreviewClose} size="small">
              <FullscreenIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderPreview()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? 'Downloading...' : 'Download Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 