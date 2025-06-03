import { create } from 'zustand';
import type { User, Preferences } from '../types/user';

interface StoreState {
  user: User | null;
  preferences: Preferences | null;
  setUser: (user: User | null) => void;
  setPreferences: (preferences: Preferences | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  preferences: null,
  setUser: (user) => set({ user }),
  setPreferences: (preferences) => set({ preferences })
})); 