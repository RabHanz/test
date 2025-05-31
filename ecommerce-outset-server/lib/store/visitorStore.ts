import { create } from 'zustand';
import type { PersonaId, EngagementLevel } from '@/types';

interface VisitorState {
  determinedPersonaId: PersonaId | null;
  engagementLevel: EngagementLevel;
  isEmailSubscriber: boolean;
  logInteraction: (action: string, data?: Record<string, any>) => void;
  setEmailSubscriberStatus: (status: boolean) => void;
}

export const useVisitorStore = create<VisitorState>((set) => ({
  determinedPersonaId: null,
  engagementLevel: 'low',
  isEmailSubscriber: false,
  logInteraction: (action, data) => {
    // In a real app, this would send analytics data
    console.log('Interaction:', action, data);
  },
  setEmailSubscriberStatus: (status) => set({ isEmailSubscriber: status }),
})); 