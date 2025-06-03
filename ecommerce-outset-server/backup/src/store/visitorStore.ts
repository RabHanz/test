import { create } from 'zustand';

interface VisitorState {
  determinedPersonaId: string | null;
  engagementLevel: 'low' | 'medium' | 'high';
  isEmailSubscriber: boolean;
  // Add actions to update state here if needed later
}

export const useVisitorStore = create<VisitorState>(() => ({
  determinedPersonaId: null,
  engagementLevel: 'low',
  isEmailSubscriber: false,
})); 