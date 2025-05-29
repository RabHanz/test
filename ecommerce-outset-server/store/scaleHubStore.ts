
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ScaleHubState } from '../types';
import { trackScaleHubEvent } from '../utils/trackingUtils';

const useScaleHubStore = create<ScaleHubState>()(
  persist(
    (set, get) => ({
      businessHealthScore: null,
      isDiagnosticCompleted: false,
      diagnosticResults: null,
      activeTool: null,

      setBusinessHealthScore: (score) => {
        set({ businessHealthScore: score });
        trackScaleHubEvent('business_health_score_updated', { score });
      },

      completeDiagnostic: (results) => {
        set({ isDiagnosticCompleted: true, diagnosticResults: results });
        trackScaleHubEvent('scale_diagnostic_completed', { results });
      },

      setActiveTool: (toolId) => {
        set({ activeTool: toolId });
        if (toolId) {
          trackScaleHubEvent('scale_tool_activated', { tool_id: toolId });
        }
      },

      resetScaleProgress: () => {
        set({
          businessHealthScore: null,
          isDiagnosticCompleted: false,
          diagnosticResults: null,
          activeTool: null,
        });
        trackScaleHubEvent('scale_progress_reset');
      },

      _loadState: (persistedState: Partial<ScaleHubState>) => {
         set(persistedState);
      }
    }),
    {
      name: 'scale-hub-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadState(state); // Call the custom loader
          console.log("Scale Hub state rehydrated");
          if (state.isDiagnosticCompleted) {
            trackScaleHubEvent('scale_diagnostic_resumed', { results_present: !!state.diagnosticResults });
          }
        }
        if (error) {
          console.error("Failed to rehydrate Scale Hub state:", error);
        }
      },
    }
  )
);

export default useScaleHubStore;