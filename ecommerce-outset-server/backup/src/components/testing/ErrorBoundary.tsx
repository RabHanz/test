import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { reportError } from '../../services/testingService';
import { PersonaType } from '../../types/testing';

interface Props {
  children: React.ReactNode;
  personaType?: PersonaType;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report error to our service
    reportError(error, {
      userInfo: {
        personaType: this.props.personaType,
      },
      impact: {
        affectedUsers: 1,
        frequency: 1,
        severity: 'HIGH',
      },
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" component="code">
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRetry}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 