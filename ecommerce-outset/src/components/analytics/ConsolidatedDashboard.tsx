import React from 'react';
import { Box, Grid, Paper, Typography, Tabs, Tab, useTheme } from '@mui/material';
import { ContentAnalyticsView } from './ContentAnalyticsView';
import { PerformanceMetricsView } from './PerformanceMetricsView';
import { FunnelAnalysisView } from './FunnelAnalysisView';
import { RevenueAnalyticsView } from './RevenueAnalyticsView';
import { AlertsRecommendationsView } from './AlertsRecommendationsView';
import { useAuth } from '../../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ConsolidatedDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Define role-based access for different analytics views
  const hasAccess = (requiredRole: string) => {
    return user?.roles?.includes(requiredRole) ?? false;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ p: 2 }}>
          Analytics Dashboard
        </Typography>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {hasAccess('content_manager') && (
            <Tab label="Content Analytics" />
          )}
          {hasAccess('performance_analyst') && (
            <Tab label="Performance Metrics" />
          )}
          {hasAccess('conversion_analyst') && (
            <Tab label="Funnel Analysis" />
          )}
          {hasAccess('revenue_analyst') && (
            <Tab label="Revenue Analytics" />
          )}
          {hasAccess('optimization_specialist') && (
            <Tab label="Alerts & Recommendations" />
          )}
        </Tabs>
      </Paper>

      <TabPanel value={selectedTab} index={0}>
        {hasAccess('content_manager') && <ContentAnalyticsView />}
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        {hasAccess('performance_analyst') && <PerformanceMetricsView />}
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        {hasAccess('conversion_analyst') && <FunnelAnalysisView />}
      </TabPanel>
      <TabPanel value={selectedTab} index={3}>
        {hasAccess('revenue_analyst') && <RevenueAnalyticsView />}
      </TabPanel>
      <TabPanel value={selectedTab} index={4}>
        {hasAccess('optimization_specialist') && <AlertsRecommendationsView />}
      </TabPanel>
    </Box>
  );
}; 