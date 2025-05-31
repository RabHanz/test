import { create } from 'zustand';

type TabId = 'overview' | 'leadScoring' | 'crm' | 'email' | 'automation' | 'reporting';

interface IntegrationsState {
  activeTab: TabId;
  isLoading: boolean;
  setActiveTab: (tab: TabId) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  activeTab: 'overview',
  isLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsLoading: (loading) => set({ isLoading: loading }),
})); 