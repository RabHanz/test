import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface AnalyticsAccessControlProps {
  children: React.ReactNode;
  requiredRole: 'ADMIN' | 'ANALYST' | 'VIEWER';
}

const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    ADMIN: ['ADMIN', 'ANALYST', 'VIEWER'],
    ANALYST: ['ANALYST', 'VIEWER'],
    VIEWER: ['VIEWER'],
  };

  return roleHierarchy[requiredRole as keyof typeof roleHierarchy]?.includes(userRole) || false;
};

export const AnalyticsAccessControl: React.FC<AnalyticsAccessControlProps> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Please log in to access the analytics dashboard.
        </Typography>
        <Button variant="contained" color="primary" href="/login">
          Log In
        </Button>
      </Box>
    );
  }

  if (!hasRequiredRole(user.role, requiredRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Insufficient Permissions
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          You don't have the required permissions to access this section.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required role: {requiredRole}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}; 