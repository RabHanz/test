import React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import AdminTestingWrapper from './AdminTestingWrapper';
import ABTestManager from './ABTestManager';
import ABTestResults from './ABTestResults';
import JourneyMetrics from './JourneyMetrics';
import FeedbackWidget from './FeedbackWidget';

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
      id={`testing-tabpanel-${index}`}
      aria-labelledby={`testing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TestingDashboard: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <AdminTestingWrapper>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Testing & Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage A/B tests, monitor journey metrics, and collect user feedback
          </Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="A/B Testing" />
            <Tab label="Journey Analytics" />
            <Tab label="User Feedback" />
          </Tabs>

          <TabPanel value={value} index={0}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Active A/B Tests
              </Typography>
              <ABTestManager />
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              <ABTestResults testId="current-test" />
            </Box>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <JourneyMetrics personaType="STARTUP_SAM" />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Feedback Collection
              </Typography>
              <FeedbackWidget pageUrl="/testing" />
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </AdminTestingWrapper>
  );
};

export default TestingDashboard; 