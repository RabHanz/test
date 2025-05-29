import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { ProgramType } from '../../types/programs';

// Program-specific components
import LaunchProgram from './programs/LaunchProgram';
import ScaleProgram from './programs/ScaleProgram';
import MasterProgram from './programs/MasterProgram';
import InvestProgram from './programs/InvestProgram';
import ConnectProgram from './programs/ConnectProgram';

// Shared components
import PortalHeader from './shared/PortalHeader';
import PortalSidebar from './shared/PortalSidebar';
import WelcomeDashboard from './shared/WelcomeDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const ClientPortal: React.FC = () => {
  const [programType, setProgramType] = React.useState<ProgramType | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <PortalHeader />
        <PortalSidebar onProgramSelect={setProgramType} />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            backgroundColor: 'background.default',
          }}
        >
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<WelcomeDashboard />} />
              <Route path="/launch" element={<LaunchProgram />} />
              <Route path="/scale" element={<ScaleProgram />} />
              <Route path="/master" element={<MasterProgram />} />
              <Route path="/invest" element={<InvestProgram />} />
              <Route path="/connect" element={<ConnectProgram />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClientPortal; 