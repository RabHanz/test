import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface Step {
  label: string;
  description: string;
}

interface BaseCalculatorProps {
  title: string;
  description: string;
  steps: Step[];
  score: number;
  onLeadCapture?: (email: string, name: string) => Promise<void>;
}

export const BaseCalculator: React.FC<BaseCalculatorProps> = ({
  title,
  description,
  steps,
  score,
  onLeadCapture,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setCompleted(true);
      setShowLeadCapture(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/leads/capture', {
        email,
        name,
        calculatorType: title,
        score,
      });

      if (response.data.success) {
        if (onLeadCapture) {
          await onLeadCapture(email, name);
        }
        setShowLeadCapture(false);
      } else {
        setError(response.data.message || 'Failed to capture lead');
      }
    } catch (err) {
      setError('An error occurred while capturing your information');
      console.error('Lead capture error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {description}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={activeStep > index}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {!showLeadCapture ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            {steps[activeStep].label}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {steps[activeStep].description}
          </Typography>

          {/* Step content will be rendered here by child components */}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1 && !completed}
            >
              {activeStep === steps.length - 1 ? 'Calculate' : 'Next'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleLeadCapture}>
          <Typography variant="h6" gutterBottom>
            Get Your Results
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter your details below to receive your detailed analysis and
            recommendations.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Your Score: {score}/100
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Get Your Results'
            )}
          </Button>
        </Box>
      )}
    </Paper>
  );
}; 