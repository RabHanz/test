import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Rocket as RocketIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  Event as EventIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { ProgramType } from '../../../types/programs';

const drawerWidth = 280;

interface PortalSidebarProps {
  onProgramSelect: (program: ProgramType | null) => void;
}

const PortalSidebar: React.FC<PortalSidebarProps> = ({ onProgramSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Launch Program', icon: <RocketIcon />, path: '/launch', program: ProgramType.LAUNCH },
    { text: 'Scale Program', icon: <TrendingUpIcon />, path: '/scale', program: ProgramType.SCALE },
    { text: 'Master Program', icon: <SchoolIcon />, path: '/master', program: ProgramType.MASTER },
    { text: 'Invest Program', icon: <AccountBalanceIcon />, path: '/invest', program: ProgramType.INVEST },
    { text: 'Connect Program', icon: <PeopleIcon />, path: '/connect', program: ProgramType.CONNECT },
  ];

  const quickAccessItems = [
    { text: 'Projects', icon: <AssignmentIcon />, path: '/projects' },
    { text: 'Learning', icon: <VideoLibraryIcon />, path: '/learning' },
    { text: 'Calendar', icon: <EventIcon />, path: '/calendar' },
    { text: 'Community', icon: <ForumIcon />, path: '/community' },
  ];

  const handleNavigation = (path: string, program?: ProgramType) => {
    navigate(path);
    onProgramSelect(program || null);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {mainMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path, item.program)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Quick Access
        </Typography>

        <List>
          {quickAccessItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default PortalSidebar; 