import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useABTesting } from '../../hooks/useABTesting';
import { ABTestResult } from '../../types/testing';

interface ABTestResultsProps {
  testId: string;
}

const ABTestResults: React.FC<ABTestResultsProps> = ({ testId }) => {
  const [results, setResults] = useState<ABTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { getResults } = useABTesting({ testId });

  const loadResults = async () => {
    setLoading(true);
    try {
      const testResults = await getResults(testId);
      setResults(testResults);
    } catch (error) {
      console.error('Error loading A/B test results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [testId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!results) {
    return (
      <Box p={3}>
        <Typography color="error">No results available</Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">A/B Test Results</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadResults}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Variant A
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Conversion Rate: {(results.variantA.conversionRate * 100).toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sample Size: {results.variantA.sampleSize}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Variant B
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Conversion Rate: {(results.variantB.conversionRate * 100).toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sample Size: {results.variantB.sampleSize}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Statistical Significance
            </Typography>
            <Typography
              variant="body2"
              color={results.isSignificant ? 'success.main' : 'error.main'}
            >
              {results.isSignificant
                ? 'Results are statistically significant'
                : 'Results are not statistically significant'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Confidence Level: {(results.confidenceLevel * 100).toFixed(2)}%
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ABTestResults; 