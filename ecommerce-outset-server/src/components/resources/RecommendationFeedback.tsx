import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ResourceMetadata } from '../../config/resourceClassification';
import { userBehaviorTrackingService } from '../../services/userBehaviorTracking';

interface RecommendationFeedbackProps {
  resource: ResourceMetadata;
  userId: string;
  onClose: () => void;
}

export const RecommendationFeedback: React.FC<RecommendationFeedbackProps> = ({
  resource,
  userId,
  onClose,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(
    null
  );

  const handleSubmit = async () => {
    try {
      if (rating) {
        await userBehaviorTrackingService.trackResourceRating(
          userId,
          resource,
          rating
        );
      }

      if (feedback) {
        await userBehaviorTrackingService.trackResourceFeedback(
          userId,
          resource,
          feedback
        );
      }

      setShowSnackbar(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFeedbackType = (type: 'positive' | 'negative') => {
    setFeedbackType(type);
    setRating(type === 'positive' ? 5 : 1);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">How was this recommendation?</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {resource.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {resource.description}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Feedback
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={feedbackType === 'positive' ? 'contained' : 'outlined'}
            startIcon={<ThumbUpIcon />}
            onClick={() => handleFeedbackType('positive')}
          >
            Helpful
          </Button>
          <Button
            variant={feedbackType === 'negative' ? 'contained' : 'outlined'}
            startIcon={<ThumbDownIcon />}
            onClick={() => handleFeedbackType('negative')}
          >
            Not Helpful
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Rating
        </Typography>
        <Rating
          value={rating}
          onChange={(_, value) => setRating(value)}
          size="large"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Additional Feedback
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Tell us more about your experience with this resource..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={!rating && !feedback}
      >
        Submit Feedback
      </Button>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setShowSnackbar(false)}>
          Thank you for your feedback!
        </Alert>
      </Snackbar>
    </Paper>
  );
}; 