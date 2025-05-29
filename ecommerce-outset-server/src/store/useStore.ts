import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface Program {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: Date;
  endDate?: Date;
}

interface Activity {
  id: string;
  type: string;
  status: string;
  userId: string;
  programId: string;
  createdAt: Date;
}

interface AppState {
  user: User | null;
  programs: Program[];
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setPrograms: (programs: Program[]) => void;
  setActivities: (activities: Activity[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

const initialState = {
  user: null,
  programs: [],
  activities: [],
  isLoading: false,
  error: null,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setPrograms: (programs) => set({ programs }),
      setActivities: (activities) => set({ activities }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearState: () => set(initialState),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        programs: state.programs,
        activities: state.activities,
      }),
    }
  )
); 