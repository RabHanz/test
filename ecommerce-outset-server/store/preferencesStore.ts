import { create } from 'zustand';

interface Preferences {
  theme?: string;
  language?: string;
  [key: string]: any;
}

interface PreferencesStore {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  clearPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  preferences: {},
  setPreferences: (preferences) => set({ preferences }),
  clearPreferences: () => set({ preferences: {} }),
})); 