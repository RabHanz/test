import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PersonaType } from '../../types/optimizationHub';
import { blogLeadScoringService } from '../../services/blogLeadScoring';
import { analyticsService } from '../../services/analytics';

interface LeadCaptureProps {
  personaType?: PersonaType;
  category?: string;
  articleId?: string;
  readTime?: number;
  interactions?: {
    comments?: boolean;
    shares?: boolean;
    saves?: boolean;
    relatedArticles?: number;
  };
  onSuccess?: () => void;
}

export const LeadCapture: React.FC<LeadCaptureProps> = ({
  personaType,
  category,
  articleId,
  readTime = 0,
  interactions = {},
  onSuccess,
}) => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Calculate lead score based on blog interactions
      const leadScore = blogLeadScoringService.calculateLeadScore([
        {
          articleId: articleId || '',
          category: category || '',
          personaType,
          readTime,
          interactions,
        },
      ]);

      // Track analytics
      await analyticsService.trackLeadCapture({
        email,
        calculatorType: 'Blog',
        score: leadScore.totalScore,
        personaType,
        leadScore: {
          totalScore: leadScore.totalScore,
          qualification: leadScore.qualification,
        },
      });

      // Send to API
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          calculatorType: 'Blog',
          score: leadScore.totalScore,
          personaType,
          category,
          articleId,
          leadScore: leadScore.totalScore,
          leadQualification: leadScore.qualification,
          interests: leadScore.interests,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        throw new Error(result.message || 'Failed to submit form');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="success">
          Thank you for subscribing! We'll keep you updated with the latest insights.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Get Expert Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Subscribe to receive personalized optimization tips and industry updates
        {personaType && ` for ${personaType.toLowerCase()} sellers`}.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
            size="small"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            size="small"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Subscribing...' : 'Subscribe Now'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          By subscribing, you agree to our privacy policy and terms of service.
        </Typography>
      </form>
    </Paper>
  );
}; 