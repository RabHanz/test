import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { IntegrationMetrics } from '../../types/integration';

interface MetricsOverviewProps {
  metrics: IntegrationMetrics;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Integrations
            </Typography>
            <Typography variant="h5">
              {metrics.overallMetrics.totalIntegrations}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Integrations
            </Typography>
            <Typography variant="h5">
              {metrics.overallMetrics.activeIntegrations}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Success Rate
            </Typography>
            <Typography variant="h5">
              {metrics.overallMetrics.successRate}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg Response Time
            </Typography>
            <Typography variant="h5">
              {metrics.overallMetrics.averageResponseTime}ms
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MetricsOverview; 