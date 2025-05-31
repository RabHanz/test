import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Contrast as ContrastIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  MotionPhotosOff as MotionOffIcon,
  MotionPhotosOn as MotionOnIcon,
  SkipNext as SkipNextIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

const actions = [
  { icon: <ContrastIcon />, name: 'High Contrast', action: 'toggleHighContrast' },
  { icon: <TextIncreaseIcon />, name: 'Increase Text', action: 'increaseFontSize' },
  { icon: <TextDecreaseIcon />, name: 'Decrease Text', action: 'decreaseFontSize' },
  { icon: <MotionOffIcon />, name: 'Reduce Motion', action: 'toggleReducedMotion' },
  { icon: <SkipNextIcon />, name: 'Skip to Content', action: 'skipToContent' },
];

export const AccessibilityToolbar: React.FC = () => {
  const {
    highContrast,
    reducedMotion,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    toggleReducedMotion,
  } = useAccessibility();

  const handleAction = (action: string) => {
    switch (action) {
      case 'toggleHighContrast':
        toggleHighContrast();
        break;
      case 'increaseFontSize':
        increaseFontSize();
        break;
      case 'decreaseFontSize':
        decreaseFontSize();
        break;
      case 'toggleReducedMotion':
        toggleReducedMotion();
        break;
      case 'skipToContent':
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
        }
        break;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <SpeedDial
        ariaLabel="Accessibility options"
        icon={<SpeedDialIcon />}
        direction="up"
        open={false}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleAction(action.action)}
            tooltipOpen
          />
        ))}
      </SpeedDial>
    </Box>
  );
}; 