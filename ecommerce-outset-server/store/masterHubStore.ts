
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MasterHubState } from '../types';
import { trackMasterHubEvent } from '../utils/trackingUtils';

const useMasterHubStore = create<MasterHubState>()(
  persist(
    (set, get) => ({
      knowledgeAssessmentCompleted: false,
      assessmentResults: {}, // DomainId: score
      currentLearningPath: [],
      completedModules: new Set<string>(),
      knowledgeConfidenceScore: null,

      completeKnowledgeAssessment: (results) => {
        set({ 
          knowledgeAssessmentCompleted: true, 
          assessmentResults: results 
        });
        trackMasterHubEvent('knowledge_assessment_completed', { results });
        // Potentially update currentLearningPath based on results here
      },

      setKnowledgeConfidence: (score) => {
        set({ knowledgeConfidenceScore: score });
        trackMasterHubEvent('knowledge_confidence_updated', { score });
      },

      completeModule: (moduleId) => {
        set((state) => ({
          completedModules: new Set(state.completedModules).add(moduleId),
        }));
        trackMasterHubEvent('master_module_completed', { module_id: moduleId });
        // Logic to advance currentLearningPath if applicable
      },

      resetMasterProgress: () => {
        set({
          knowledgeAssessmentCompleted: false,
          assessmentResults: {},
          currentLearningPath: [],
          completedModules: new Set<string>(),
          knowledgeConfidenceScore: null,
        });
        trackMasterHubEvent('master_progress_reset');
      },
      
      _loadState: (persistedState) => {
        const rehydratedState: Partial<MasterHubState> = { ...persistedState };
        if (persistedState.completedModules) {
           rehydratedState.completedModules = new Set(Array.from(persistedState.completedModules));
        }
        set(rehydratedState);
     }
    }),
    {
      name: 'master-hub-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadState(state);
          console.log("Master Hub state rehydrated");
          if (state.knowledgeAssessmentCompleted) {
            trackMasterHubEvent('master_assessment_resumed', { results_present: Object.keys(state.assessmentResults || {}).length > 0 });
          }
        }
        if (error) {
          console.error("Failed to rehydrate Master Hub state:", error);
        }
      },
    }
  )
);

export default useMasterHubStore;