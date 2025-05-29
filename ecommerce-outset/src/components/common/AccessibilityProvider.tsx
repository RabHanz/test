import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '@mui/material';

interface AccessibilityContextType {
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const theme = useTheme();
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Apply initial accessibility settings
    document.documentElement.style.fontSize = `${fontSize}px`;
    if (highContrast) {
      document.body.classList.add('high-contrast');
    }
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  }, []);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
    }
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    document.body.classList.toggle('reduced-motion');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Alt + H: Toggle high contrast
      if (event.altKey && event.key === 'h') {
        toggleHighContrast();
      }
      // Alt + +: Increase font size
      if (event.altKey && event.key === '+') {
        increaseFontSize();
      }
      // Alt + -: Decrease font size
      if (event.altKey && event.key === '-') {
        decreaseFontSize();
      }
      // Alt + M: Toggle reduced motion
      if (event.altKey && event.key === 'm') {
        toggleReducedMotion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [highContrast, fontSize, reducedMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        fontSize,
        reducedMotion,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
        toggleReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}; 