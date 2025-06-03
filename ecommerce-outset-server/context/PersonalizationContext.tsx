"use client";

import React, { createContext, useContext, useState } from 'react';

interface PersonalizationContextType {
  preferences: { theme: string; language: string };
  setPreferences: (preferences: { theme: string; language: string }) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState({ theme: 'light', language: 'en' });

  return (
    <PersonalizationContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}; 