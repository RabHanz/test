
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
    ClientSuccessState, ClientPortalSection, PersonaId, ClientOnboardingStep, ClientDocument, ClientGoal, ClientCommunicationPreference, 
    LaunchProgramClientData, ClientProgramMilestone, ClientProgramTask, ClientKPI
} from '../types';
import { 
    LAUNCH_PROGRAM_ONBOARDING_CHECKLIST, LAUNCH_PROGRAM_REQUIRED_DOCUMENTS, LAUNCH_PROGRAM_MILESTONES, DEFAULT_CLIENT_KPIS
} from '../constants'; // Assuming these will be defined in constants.ts
import { trackConnectHubEvent } from '../utils/trackingUtils'; // Placeholder for client success tracking


const initialLaunchProgramData: LaunchProgramClientData = {
    currentRoadmapDay: 1,
    activeMilestoneId: LAUNCH_PROGRAM_MILESTONES.length > 0 ? LAUNCH_PROGRAM_MILESTONES[0].id : null,
    completedTasks: new Set(),
    productSelectionFrameworkAnswers: {},
    riskAssessmentChecklistAnswers: {},
};

const initialClientSuccessState: Omit<ClientSuccessState, 'isLoading' | 'setActivePortalSection' | 'loadClientData' | 'completeOnboardingStep' | 'addDocument' | 'updateDocumentStatus' | 'addGoal' | 'updateGoal' | 'toggleGoalAchieved' | 'saveCommunicationPreferences' | 'completeOnboarding' | 'completeLaunchProgramTask' | 'updateLaunchFrameworkAnswers' | 'submitTestimonial' | 'updateClientKPI'| '_hydrateClientState' > = {
    activePortalSection: 'onboarding',
    clientPersonaId: null,
    clientName: "Valued Client",
    onboardingChecklist: [],
    documents: [],
    goals: [],
    communicationPreferences: null,
    isOnboardingComplete: false,
    currentProgramData: null,
    programMilestones: [],
    unreadMessagesCount: 0,
    upcomingAppointments: [],
    kpis: [],
    satisfactionScore: null,
    testimonialSubmitted: false,
};


const useClientSuccessStore = create<ClientSuccessState>()(
    persist(
        (set, get) => ({
            ...initialClientSuccessState,
            isLoading: false,

            setActivePortalSection: (section) => set({ activePortalSection: section }),

            loadClientData: async (assumedPersonaId) => {
                set({ isLoading: true, clientPersonaId: assumedPersonaId });
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));

                let onboardingChecklist: ClientOnboardingStep[] = [];
                let documents: ClientDocument[] = [];
                let programMilestones: ClientProgramMilestone[] = [];
                let currentProgramData: ClientSuccessState['currentProgramData'] = null;
                let kpis: ClientKPI[] = DEFAULT_CLIENT_KPIS;


                // TODO: Add specific tracking for client portal events
                // trackConnectHubEvent('client_portal_data_loaded', { personaId: assumedPersonaId });


                switch(assumedPersonaId) {
                    case 'launch':
                        onboardingChecklist = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_ONBOARDING_CHECKLIST)); // Deep clone
                        documents = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_REQUIRED_DOCUMENTS));
                        programMilestones = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_MILESTONES));
                        currentProgramData = { ...initialLaunchProgramData };
                        // Customize KPIs for Launch persona if needed
                        break;
                    // Add cases for 'scale', 'master', 'invest', 'connect' using their specific constants
                    default:
                        onboardingChecklist = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_ONBOARDING_CHECKLIST)); // Fallback for now
                        documents = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_REQUIRED_DOCUMENTS));
                        programMilestones = JSON.parse(JSON.stringify(LAUNCH_PROGRAM_MILESTONES));
                        currentProgramData = { ...initialLaunchProgramData };
                        break;
                }
                
                // Check if onboarding was previously completed from persisted state
                const persistedState = get();
                const isOnboardingComplete = persistedState.isOnboardingComplete || false;


                set({ 
                    onboardingChecklist, 
                    documents,
                    programMilestones,
                    currentProgramData,
                    kpis,
                    isLoading: false,
                    activePortalSection: isOnboardingComplete ? 'dashboard' : 'onboarding',
                    // Restore other persisted fields if necessary
                    clientName: persistedState.clientName || "Valued Client",
                    goals: persistedState.goals || [],
                    communicationPreferences: persistedState.communicationPreferences || null,
                    unreadMessagesCount: persistedState.unreadMessagesCount || 0,
                    upcomingAppointments: persistedState.upcomingAppointments || [],
                    satisfactionScore: persistedState.satisfactionScore || null,
                    testimonialSubmitted: persistedState.testimonialSubmitted || false,
                 });
            },
            
            completeOnboardingStep: (stepId, subStepId) => set(state => {
                const newChecklist = state.onboardingChecklist.map(step => {
                    if (step.id === stepId) {
                        if (subStepId && step.subSteps) {
                            const newSubSteps = step.subSteps.map(sub => sub.id === subStepId ? { ...sub, isCompleted: true } : sub);
                            const allSubStepsCompleted = newSubSteps.every(sub => sub.isCompleted);
                            return { ...step, subSteps: newSubSteps, isCompleted: allSubStepsCompleted };
                        }
                        return { ...step, isCompleted: true };
                    }
                    return step;
                });
                return { onboardingChecklist: newChecklist };
            }),

            addDocument: (doc) => set(state => ({
                documents: [...state.documents, { ...doc, id: `doc_${Date.now()}`, status: 'pending_submission' }]
            })),
            
            updateDocumentStatus: (docId, status, notes) => set(state => ({
                documents: state.documents.map(doc => doc.id === docId ? { ...doc, status, notes: notes || doc.notes, uploadDate: status === 'submitted_for_review' ? new Date().toISOString() : doc.uploadDate } : doc)
            })),

            addGoal: (goal) => set(state => ({
                goals: [...state.goals, { ...goal, id: `goal_${Date.now()}`, isAchieved: false }]
            })),

            updateGoal: (goalId, updates) => set(state => ({
                goals: state.goals.map(g => g.id === goalId ? { ...g, ...updates } : g)
            })),

            toggleGoalAchieved: (goalId) => set(state => ({
                goals: state.goals.map(g => g.id === goalId ? { ...g, isAchieved: !g.isAchieved } : g)
            })),
            
            saveCommunicationPreferences: (prefs) => set({ communicationPreferences: prefs }),

            completeOnboarding: () => {
                set({ isOnboardingComplete: true, activePortalSection: 'dashboard' });
                // trackConnectHubEvent('client_onboarding_completed');
            },

            completeLaunchProgramTask: (milestoneId, taskId, subTaskId) => set(state => {
                if (state.clientPersonaId !== 'launch' || !state.currentProgramData) return state;
                const launchData = state.currentProgramData as LaunchProgramClientData;
                const newCompletedTasks = new Set(launchData.completedTasks);
                
                const targetMilestone = state.programMilestones.find(m => m.id === milestoneId);
                if (!targetMilestone) return state;

                let taskUpdated = false;
                const updatedTasksForMilestone = targetMilestone.tasks.map(task => {
                    if (task.id === taskId) {
                        if (subTaskId && task.subTasks) {
                            let subTaskUpdated = false;
                            const updatedSubTasks = task.subTasks.map(sub => {
                                if (sub.id === subTaskId && !newCompletedTasks.has(subTaskId)) {
                                    newCompletedTasks.add(subTaskId);
                                    subTaskUpdated = true;
                                    return { ...sub, isCompleted: true };
                                }
                                return sub;
                            });
                            if (subTaskUpdated) {
                                taskUpdated = true;
                                const allSubTasksDone = updatedSubTasks.every(st => st.isCompleted);
                                if(allSubTasksDone && !newCompletedTasks.has(taskId)) newCompletedTasks.add(taskId);
                                return { ...task, subTasks: updatedSubTasks, isCompleted: allSubTasksDone };
                            }
                        } else if (!subTaskId && !newCompletedTasks.has(taskId)) {
                            newCompletedTasks.add(taskId);
                            taskUpdated = true;
                            return { ...task, isCompleted: true };
                        }
                    }
                    return task;
                });

                if (!taskUpdated) return state; // No change if task was already complete or not found

                const updatedProgramMilestones = state.programMilestones.map(m => 
                    m.id === milestoneId ? { ...m, tasks: updatedTasksForMilestone, isAchieved: updatedTasksForMilestone.every(t => t.isCompleted) } : m
                );
                
                // Update activeMilestoneId if current one is achieved
                let newActiveMilestoneId = launchData.activeMilestoneId;
                const currentActiveMilestone = updatedProgramMilestones.find(m => m.id === launchData.activeMilestoneId);
                if (currentActiveMilestone?.isAchieved) {
                    const currentIndex = updatedProgramMilestones.findIndex(m => m.id === launchData.activeMilestoneId);
                    if (currentIndex < updatedProgramMilestones.length - 1) {
                        newActiveMilestoneId = updatedProgramMilestones[currentIndex + 1].id;
                    } else {
                        newActiveMilestoneId = null; // All milestones completed
                    }
                }


                return {
                    programMilestones: updatedProgramMilestones,
                    currentProgramData: {
                        ...launchData,
                        completedTasks: newCompletedTasks,
                        activeMilestoneId: newActiveMilestoneId
                    }
                };
            }),

            updateLaunchFrameworkAnswers: (framework, answers) => set(state => {
                 if (state.clientPersonaId !== 'launch' || !state.currentProgramData) return state;
                 const launchData = state.currentProgramData as LaunchProgramClientData;
                 return {
                    currentProgramData: {
                        ...launchData,
                        [framework === 'productSelection' ? 'productSelectionFrameworkAnswers' : 'riskAssessmentChecklistAnswers']: answers,
                    }
                 }
            }),

            submitTestimonial: (text, rating) => {
                // trackConnectHubEvent('client_testimonial_submitted', { rating });
                set({ testimonialSubmitted: true, satisfactionScore: rating });
            },
            updateClientKPI: (kpiId, currentValue) => set(state => ({
                kpis: state.kpis.map(kpi => kpi.id === kpiId ? {...kpi, currentValue, lastUpdated: new Date().toISOString()} : kpi)
            })),


            _hydrateClientState: (persistedState) => {
                const rehydratedProgramData = persistedState.currentProgramData;
                if (rehydratedProgramData && persistedState.clientPersonaId === 'launch') {
                    (rehydratedProgramData as LaunchProgramClientData).completedTasks = new Set(Array.from((rehydratedProgramData as LaunchProgramClientData).completedTasks || []));
                }
                // Add similar hydration for other persona program data if they use Sets or other non-JSON-friendly types
                set({
                     ...persistedState,
                     currentProgramData: rehydratedProgramData,
                     // Ensure other Set/Map like structures are rehydrated if added later
                });
            }
        }),
        {
            name: 'client-success-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state, error) => {
                if (state) {
                    state._hydrateClientState(state);
                    console.log("Client Success state rehydrated");
                }
                if (error) {
                    console.error("Failed to rehydrate Client Success state:", error);
                }
            },
        }
    )
);

export default useClientSuccessStore;
