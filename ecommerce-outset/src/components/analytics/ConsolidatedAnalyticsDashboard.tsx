import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Speed as SpeedIcon,
  FilterAlt as FunnelIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { AnalyticsAccessControl } from './AnalyticsAccessControl';
import { ContentAnalyticsView } from './views/ContentAnalyticsView';
import { PerformanceMetricsView } from './views/PerformanceMetricsView';
import { FunnelAnalyticsView } from './views/FunnelAnalyticsView';
import { RevenueAnalyticsView } from './views/RevenueAnalyticsView';
import { AlertsAndRecommendationsView } from './views/AlertsAndRecommendationsView';
import { AnalyticsOverview } from './views/AnalyticsOverview';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analytics-tabpanel-${index}`}
    aria-labelledby={`analytics-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <DashboardIcon />,
    component: <AnalyticsOverview />,
    requiredRole: 'VIEWER' as const,
  },
  {
    id: 'content',
    label: 'Content Analytics',
    icon: <ArticleIcon />,
    component: <ContentAnalyticsView />,
    requiredRole: 'ANALYST' as const,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <SpeedIcon />,
    component: <PerformanceMetricsView />,
    requiredRole: 'ANALYST' as const,
  },
  {
    id: 'funnel',
    label: 'Funnel Analysis',
    icon: <FunnelIcon />,
    component: <FunnelAnalyticsView />,
    requiredRole: 'ADMIN' as const,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: <MoneyIcon />,
    component: <RevenueAnalyticsView />,
    requiredRole: 'ADMIN' as const,
  },
  {
    id: 'alerts',
    label: 'Alerts & Recommendations',
    icon: <NotificationsIcon />,
    component: <AlertsAndRecommendationsView />,
    requiredRole: 'ADMIN' as const,
  },
];

export const ConsolidatedAnalyticsDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            id={`analytics-tab-${index}`}
            aria-controls={`analytics-tabpanel-${index}`}
          />
        ))}
      </Tabs>
    </Box>
  );

  return (
    <AnalyticsAccessControl requiredRole="ADMIN">
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              Analytics Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {isMobile ? (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
                marginTop: '64px',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            marginTop: '64px',
          }}
        >
          {tabs.map((tab, index) => (
            <TabPanel key={tab.id} value={selectedTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </Box>
    </AnalyticsAccessControl>
  );
}; 