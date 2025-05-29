
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ConnectHubState } from '../types';
import { trackConnectHubEvent } from '../utils/trackingUtils';

const useConnectHubStore = create<ConnectHubState>()(
  persist(
    (set, get) => ({
      servicePositioningAssessmentCompleted: false,
      assessmentScore: null,
      clientQualityScore: null, // Example: 0-100
      avgProjectValue: null,    // Example: 5000
      activeClientOpportunities: [],

      completeServicePositioningAssessment: (score) => {
        set({ servicePositioningAssessmentCompleted: true, assessmentScore: score });
        trackConnectHubEvent('service_positioning_assessment_completed', { score });
      },

      updateClientQualityScore: (score) => {
        set({ clientQualityScore: score });
        trackConnectHubEvent('client_quality_score_updated', { score });
      },

      updateAvgProjectValue: (value) => {
        set({ avgProjectValue: value });
        trackConnectHubEvent('avg_project_value_updated', { value });
      },

      addClientOpportunity: (opportunityId) => {
        set((state) => ({
          activeClientOpportunities: [...new Set([...state.activeClientOpportunities, opportunityId])],
        }));
        trackConnectHubEvent('client_opportunity_added', { opportunity_id: opportunityId });
      },

      resetConnectProgress: () => {
        set({
          servicePositioningAssessmentCompleted: false,
          assessmentScore: null,
          clientQualityScore: null,
          avgProjectValue: null,
          activeClientOpportunities: [],
        });
        trackConnectHubEvent('connect_progress_reset');
      },
      
      _loadState: (persistedState) => {
         set(persistedState); 
      }
    }),
    {
      name: 'connect-hub-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadState(state); // Ensure _loadState is called
          console.log("Connect Hub state rehydrated");
          if (state.servicePositioningAssessmentCompleted) {
            trackConnectHubEvent('connect_assessment_resumed', { score_present: !!state.assessmentScore });
          }
        }
        if (error) {
          console.error("Failed to rehydrate Connect Hub state:", error);
        }
      },
    }
  )
);

export default useConnectHubStore;