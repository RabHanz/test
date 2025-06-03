import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useThemeStore } from '../../store/themeStore';
import { usePreferencesStore } from '../../store/preferencesStore';

interface PersonalizedUIProps {
  children: React.ReactNode;
}

export const PersonalizedUI: React.FC<PersonalizedUIProps> = ({ children }) => {
  const { user } = useUserStore();
  const { theme } = useThemeStore();
  const { preferences } = usePreferencesStore();

  const getPersonalizedStyles = () => {
    const styles: Record<string, string> = {};

    // Apply user preferences
    if (preferences.fontSize) {
      styles['--base-font-size'] = preferences.fontSize;
    }

    if (preferences.colorScheme) {
      styles['--color-scheme'] = preferences.colorScheme;
    }

    if (preferences.contrast) {
      styles['--contrast-level'] = preferences.contrast;
    }

    // Apply theme
    if (theme) {
      styles['--primary-color'] = theme.primary;
      styles['--secondary-color'] = theme.secondary;
      styles['--accent-color'] = theme.accent;
      styles['--background-color'] = theme.background;
      styles['--text-color'] = theme.text;
    }

    // Apply user role-specific styles
    if (user?.role) {
      styles['--role-specific-color'] = getRoleColor(user.role);
    }

    return styles;
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#FF4B4B';
      case 'moderator':
        return '#4B7BFF';
      case 'premium':
        return '#FFB74B';
      default:
        return '#4BFF4B';
    }
  };

  return (
    <div
      className="personalized-ui"
      style={getPersonalizedStyles()}
      data-theme={theme?.name}
      data-user-role={user?.role}
    >
      {children}
    </div>
  );
}; 