import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { FBAProfitCalculator } from '../../components/calculators/FBAProfitCalculator';
import { ProductResearchValidator } from '../../components/calculators/ProductResearchValidator';
import { PPCOptimizationTool } from '../../components/calculators/PPCOptimizationTool';
import { BusinessHealthAssessmentTool } from '../../components/calculators/BusinessHealthAssessmentTool';

const ToolsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLeadCapture = async (email: string, name: string) => {
    // TODO: Implement lead capture logic
    console.log('Lead captured:', { email, name });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Amazon Seller Tools
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Optimize your Amazon business with our suite of powerful calculators and assessment tools.
          Get data-driven insights to make informed decisions and grow your business.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
            }}
          >
            <FBAProfitCalculator onLeadCapture={handleLeadCapture} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
            }}
          >
            <ProductResearchValidator onLeadCapture={handleLeadCapture} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
            }}
          >
            <PPCOptimizationTool onLeadCapture={handleLeadCapture} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
            }}
          >
            <BusinessHealthAssessmentTool onLeadCapture={handleLeadCapture} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ToolsPage; 