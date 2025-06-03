'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

const Unauthorized: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(user ? '/dashboard' : '/auth/login')}
            sx={{ mt: 2 }}
          >
            {user ? 'Go to Dashboard' : 'Sign In'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized; 