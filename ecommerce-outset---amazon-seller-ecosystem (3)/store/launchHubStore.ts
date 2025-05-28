
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RoadmapStep } from '../types'; // Assuming RoadmapStep is defined in types.ts
import { LAUNCH_ROADMAP_STEPS } from '../constants';
import { trackLaunchHubEvent } from '../utils/trackingUtils'; // Updated Import

interface LaunchHubState {
  // Roadmap progress: store IDs of completed steps
  completedRoadmapSteps: Set<string>;
  currentRoadmapStepId: string | null; // ID of the current step user is on

  isLaunchAssessmentCompleted: boolean;
  assessmentScore: number | null; // Example for storing assessment result

  // Basic tracking for tool usage (could be more granular)
  toolsUsed: Set<string>; // Store IDs of tools user interacted with

  // Actions
  completeStep: (stepId: string) => void;
  setCurrentStep: (stepId: string | null) => void;
  completeAssessment: (score: number) => void;
  useTool: (toolId: string) => void;
  resetLaunchProgress: () => void;

  // For persist middleware
  _loadState: (persistedState: Partial<LaunchHubState>) => void;
}

const useLaunchHubStore = create<LaunchHubState>()(
  persist(
    (set, get) => ({
      completedRoadmapSteps: new Set<string>(),
      currentRoadmapStepId: LAUNCH_ROADMAP_STEPS.length > 0 ? LAUNCH_ROADMAP_STEPS[0].id : null,
      isLaunchAssessmentCompleted: false,
      assessmentScore: null,
      toolsUsed: new Set<string>(),

      completeStep: (stepId) => {
        set((state) => ({
          completedRoadmapSteps: new Set(state.completedRoadmapSteps).add(stepId),
        }));
        trackLaunchHubEvent('roadmap_step_completed', { step_id: stepId });
        // Logic to advance currentRoadmapStepId if needed
        const currentIndex = LAUNCH_ROADMAP_STEPS.findIndex(s => s.id === stepId);
        if (currentIndex !== -1 && currentIndex < LAUNCH_ROADMAP_STEPS.length - 1) {
            get().setCurrentStep(LAUNCH_ROADMAP_STEPS[currentIndex + 1].id);
        } else if (currentIndex === LAUNCH_ROADMAP_STEPS.length -1) {
            get().setCurrentStep(null); // Roadmap completed
            trackLaunchHubEvent('roadmap_completed');
        }
      },

      setCurrentStep: (stepId) => set({ currentRoadmapStepId: stepId }),

      completeAssessment: (score) => {
        set({ isLaunchAssessmentCompleted: true, assessmentScore: score });
        trackLaunchHubEvent('launch_assessment_completed', { score });
      },

      useTool: (toolId) => {
        set((state) => ({
          toolsUsed: new Set(state.toolsUsed).add(toolId),
        }));
        trackLaunchHubEvent('launch_tool_used', { tool_id: toolId });
      },

      resetLaunchProgress: () => {
        set({
          completedRoadmapSteps: new Set<string>(),
          currentRoadmapStepId: LAUNCH_ROADMAP_STEPS.length > 0 ? LAUNCH_ROADMAP_STEPS[0].id : null,
          isLaunchAssessmentCompleted: false,
          assessmentScore: null,
          toolsUsed: new Set<string>(),
        });
        trackLaunchHubEvent('launch_progress_reset');
      },

      // Helper for rehydrating Set objects
      _loadState: (persistedState) => {
         const rehydratedState: Partial<LaunchHubState> = { ...persistedState };
         if (persistedState.completedRoadmapSteps) {
            rehydratedState.completedRoadmapSteps = new Set(Array.from(persistedState.completedRoadmapSteps));
         }
         if (persistedState.toolsUsed) {
            rehydratedState.toolsUsed = new Set(Array.from(persistedState.toolsUsed));
         }
         set(rehydratedState);
      }
    }),
    {
      name: 'launch-hub-storage',
      storage: createJSONStorage(() => localStorage),
      // Custom hydration to handle Set objects correctly
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadState(state); // Call the custom loader
          console.log("Launch Hub state rehydrated");
           // Track if user was in the middle of the roadmap
          if(state.completedRoadmapSteps && state.completedRoadmapSteps.size > 0 && state.currentRoadmapStepId) {
            trackLaunchHubEvent('launch_roadmap_resumed', { last_completed_step_count: state.completedRoadmapSteps.size });
          }
        }
        if (error) {
          console.error("Failed to rehydrate Launch Hub state:", error);
        }
      },
       // partialize: (state) => ({ ... }), // if you want to persist only specific parts
    }
  )
);

export default useLaunchHubStore;
