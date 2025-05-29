import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block as BlockIcon } from '@mui/icons-material';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent>
          <Box mb={4} textAlign="center">
            <BlockIcon color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h4" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have permission to access this page.
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/portal')}
          >
            Return to Portal
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UnauthorizedPage; 