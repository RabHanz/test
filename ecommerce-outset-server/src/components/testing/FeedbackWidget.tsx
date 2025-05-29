import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
  SentimentSatisfied as SatisfactionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { submitFeedback } from '../../services/testingService';
import { UserFeedback, PersonaType } from '../../types/testing';

interface FeedbackWidgetProps {
  personaType?: PersonaType;
  pageUrl: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ personaType, pageUrl }) => {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<UserFeedback['type']>('HELPFULNESS');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFeedbackType('HELPFULNESS');
    setRating(null);
    setComment('');
    setScreenshot(null);
  };

  const handleSubmit = async () => {
    try {
      await submitFeedback({
        type: feedbackType,
        rating: rating || undefined,
        comment: comment || undefined,
        screenshot: screenshot || undefined,
        personaType,
        pageUrl,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          browser: getBrowserInfo(),
        },
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body);
      setScreenshot(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  return (
    <>
      <Tooltip title="Provide Feedback">
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <FeedbackIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Provide Feedback</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant={feedbackType === 'HELPFULNESS' ? 'contained' : 'outlined'}
              onClick={() => setFeedbackType('HELPFULNESS')}
              startIcon={<FeedbackIcon />}
            >
              Helpfulness
            </Button>
            <Button
              variant={feedbackType === 'BUG' ? 'contained' : 'outlined'}
              onClick={() => setFeedbackType('BUG')}
              startIcon={<BugIcon />}
            >
              Bug Report
            </Button>
            <Button
              variant={feedbackType === 'FEATURE_REQUEST' ? 'contained' : 'outlined'}
              onClick={() => setFeedbackType('FEATURE_REQUEST')}
              startIcon={<FeatureIcon />}
            >
              Feature Request
            </Button>
            <Button
              variant={feedbackType === 'SATISFACTION' ? 'contained' : 'outlined'}
              onClick={() => setFeedbackType('SATISFACTION')}
              startIcon={<SatisfactionIcon />}
            >
              Satisfaction
            </Button>
          </Box>

          {feedbackType === 'HELPFULNESS' && (
            <Box mb={3}>
              <Typography component="legend">How helpful was this page?</Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
                precision={0.5}
              />
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your feedback"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            margin="normal"
          />

          {feedbackType === 'BUG' && (
            <Box mt={2}>
              <Button
                variant="outlined"
                onClick={captureScreenshot}
                disabled={!!screenshot}
              >
                {screenshot ? 'Screenshot Captured' : 'Capture Screenshot'}
              </Button>
              {screenshot && (
                <Box mt={2}>
                  <img
                    src={screenshot}
                    alt="Screenshot"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!comment && !rating}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'Internet Explorer';
  
  return browser;
}

export default FeedbackWidget; 