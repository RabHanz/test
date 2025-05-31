import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface AdminAutomationWrapperProps {
  children: React.ReactNode;
}

const AdminAutomationWrapper: React.FC<AdminAutomationWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminAutomationWrapper; 