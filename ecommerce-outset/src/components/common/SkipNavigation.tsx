import React from 'react';
import { Box, Button } from '@mui/material';

export const SkipNavigation: React.FC = () => {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <Box
      component="nav"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <Button
        onClick={handleSkip}
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          height: 1,
          width: 1,
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            left: 0,
            top: 0,
            height: 'auto',
            width: 'auto',
            padding: 2,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            zIndex: 1100,
          },
        }}
      >
        Skip to main content
      </Button>
    </Box>
  );
}; 