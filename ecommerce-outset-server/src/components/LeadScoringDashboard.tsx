import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  ScoreChart,
  LeadList,
  IntegrationStatus,
  AutomationRules,
  BehavioralTracking,
  PersonaRouting,
} from './dashboard';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const LeadScoringDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  return (
    <DashboardContainer maxWidth="xl">
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Lead Scoring Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Monitor and manage lead scoring across all integrated platforms
          </Typography>
        </Grid>

        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Integration Status
            </Typography>
            <IntegrationStatus />
          </DashboardPaper>
        </Grid>

        {/* Lead Score Overview */}
        <Grid item xs={12} md={6}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Lead Score Overview
            </Typography>
            <ScoreChart />
          </DashboardPaper>
        </Grid>

        {/* Behavioral Tracking */}
        <Grid item xs={12} md={8}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Behavioral Tracking
            </Typography>
            <BehavioralTracking />
          </DashboardPaper>
        </Grid>

        {/* Persona Routing */}
        <Grid item xs={12} md={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Persona Routing
            </Typography>
            <PersonaRouting />
          </DashboardPaper>
        </Grid>

        {/* Lead List */}
        <Grid item xs={12} md={8}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Lead List
            </Typography>
            <LeadList onSelectLead={setSelectedLead} />
          </DashboardPaper>
        </Grid>

        {/* Automation Rules */}
        <Grid item xs={12} md={4}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Automation Rules
            </Typography>
            <AutomationRules />
          </DashboardPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default LeadScoringDashboard; 