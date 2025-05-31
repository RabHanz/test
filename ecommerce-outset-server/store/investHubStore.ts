
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InvestHubState } from '../types';
import { trackInvestHubEvent } from '../utils/trackingUtils';

const useInvestHubStore = create<InvestHubState>()(
  persist(
    (set, get) => ({
      investmentAssessmentCompleted: false,
      assessmentResults: null,
      portfolioValue: null, 
      activeDealId: null,

      completeInvestmentAssessment: (results) => {
        set({ investmentAssessmentCompleted: true, assessmentResults: results });
        trackInvestHubEvent('investment_assessment_completed', { results });
      },

      setPortfolioValue: (value) => {
        set({ portfolioValue: value });
        trackInvestHubEvent('portfolio_value_updated', { value });
      },

      setActiveDeal: (dealId) => {
        set({ activeDealId: dealId });
        if (dealId) {
          trackInvestHubEvent('active_deal_set', { deal_id: dealId });
        }
      },
      
      resetInvestProgress: () => {
        set({
          investmentAssessmentCompleted: false,
          assessmentResults: null,
          portfolioValue: null,
          activeDealId: null,
        });
        trackInvestHubEvent('invest_progress_reset');
      },
      
      _loadState: (persistedState) => {
         set(persistedState); 
      }
    }),
    {
      name: 'invest-hub-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadState(state);
          console.log("Invest Hub state rehydrated");
          if (state.investmentAssessmentCompleted) {
            trackInvestHubEvent('invest_assessment_resumed', { results_present: !!state.assessmentResults });
          }
        }
        if (error) {
          console.error("Failed to rehydrate Invest Hub state:", error);
        }
      },
    }
  )
);

export default useInvestHubStore;