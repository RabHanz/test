
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizState, UserAnswers, PersonaId, QuizResult, Persona as PersonaType } from '../types';
import { QUIZ_QUESTIONS, PERSONAS_DATA } from '../constants';
import { trackQuizEvent } from '../utils/trackingUtils';
import useVisitorStore from './visitorStore';

const initialScores = PERSONAS_DATA.reduce((acc, persona) => {
  acc[persona.id as PersonaId] = 0;
  return acc;
}, {} as Record<PersonaId, number>);

if (!initialScores['unknown']) {
  initialScores['unknown'] = 0; // Ensure 'unknown' is in initialScores
}
if (!initialScores['default_exit']) {
    initialScores['default_exit'] = 0; // Ensure 'default_exit' is in initialScores
}


const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      totalSteps: 1 + QUIZ_QUESTIONS.length + 1, // Welcome + Questions + Results
      email: '',
      hasConsented: false,
      answers: {},
      scores: { ...initialScores },
      quizCompleted: false,
      isLoading: false,
      quizResult: null,

      setEmail: (email) => set({ email }),
      setHasConsented: (consented) => set({ hasConsented: consented }),

      startQuiz: () => {
        trackQuizEvent('email_submitted', { email: get().email, context: 'quiz' });
        set({ currentStep: 1 });
      },

      answerQuestion: (questionId, answerId, questionScores) => {
        const newAnswers = { ...get().answers, [questionId]: answerId };
        const newScores = { ...get().scores };
        questionScores.forEach(scoreEntry => {
          newScores[scoreEntry.personaId] = (newScores[scoreEntry.personaId] || 0) + scoreEntry.points;
        });

        set({ answers: newAnswers, scores: newScores });
        trackQuizEvent('question_answered', { context: 'quiz', questionId, answerId, currentScores: newScores });
        get().goToNextStep();
      },

      skipQuestion: (questionId) => {
        trackQuizEvent('question_skipped', { context: 'quiz', questionId });
        get().goToNextStep();
      },

      goToNextStep: () => {
        const currentStep = get().currentStep;
        const totalQuestions = QUIZ_QUESTIONS.length;
        if (currentStep < totalQuestions +1) { // +1 for welcome/email step
          set({ isLoading: true });
          setTimeout(() => {
            set({ currentStep: currentStep + 1, isLoading: false });
          }, 300);
        } else if (currentStep === totalQuestions + 1 && !get().quizCompleted) {
          get().calculateResults(PERSONAS_DATA);
        }
      },

      calculateResults: (personasData) => {
        const finalScores = get().scores;
        let highestScore = -1;
        let primaryPersonaId: PersonaId = 'unknown';

        const validScoredPersonas: Array<{ id: PersonaId; score: number }> = [];

        for (const key in finalScores) {
            const personaIdKey = key as PersonaId;
            const score = finalScores[personaIdKey];
            if (typeof score === 'number') { // Ensure score is a number
                validScoredPersonas.push({ id: personaIdKey, score });
                if (personaIdKey !== 'unknown' && personaIdKey !== 'default_exit' && score > highestScore) {
                    highestScore = score;
                    primaryPersonaId = personaIdKey;
                }
            }
        }
        
        // Fallback if no persona scored high enough, or only 'unknown' / 'default_exit' scored.
        if (highestScore <= 0 && primaryPersonaId === 'unknown') {
             primaryPersonaId = 'unknown'; // Explicitly set to unknown if no clear winner
        }


        const primaryPersonaFromData = personasData.find(p => p.id === primaryPersonaId) || personasData.find(p => p.id === 'unknown');

        const allNumericScores = Object.values(finalScores).filter(s => typeof s === 'number') as number[];
        const totalScoreSum = allNumericScores.reduce((sum, s) => sum + s, 0);
        
        let primaryPersonaForState: PersonaType | null = null;
        let primaryPersonaConfidence = 0;

        if (primaryPersonaFromData) {
            const primaryScoreValue = finalScores[primaryPersonaFromData.id as PersonaId];
            primaryPersonaConfidence = (typeof primaryScoreValue === 'number' && totalScoreSum > 0)
                ? Math.round((primaryScoreValue / totalScoreSum) * 100)
                : 0;
            primaryPersonaForState = {
                ...primaryPersonaFromData,
                memberCount: `${primaryPersonaConfidence}% Match` // Update memberCount to show confidence
            };
        }

        const secondaryPersonasResult = validScoredPersonas
            .filter(sp => {
                const score = sp.score; // score is already a number here
                return sp.id !== primaryPersonaId && sp.id !== 'unknown' && sp.id !== 'default_exit' && score > (highestScore * 0.4) && score > 5;
            })
            .sort((a, b) => b.score - a.score)
            .map(sp => personasData.find(p => p.id === sp.id))
            .filter(p => p !== null) as PersonaType[];


        const allScoresForDisplay: QuizResult['allScores'] = validScoredPersonas
            .sort((a,b) => b.score - a.score)
            .map(sp => ({
                personaId: sp.id,
                score: sp.score, // score is already a number
                confidence: totalScoreSum > 0 ? Math.round((sp.score / totalScoreSum) * 100) : 0
            }));

        const result: QuizResult = { primaryPersona: primaryPersonaForState, secondaryPersonas: secondaryPersonasResult, allScores: allScoresForDisplay };
        
        set({ quizResult: result, quizCompleted: true, isLoading: false, currentStep: get().totalSteps });
        
        const determinedPersonaIdForStore = primaryPersonaForState ? primaryPersonaForState.id : 'unknown';
        useVisitorStore.getState().setDeterminedPersona(determinedPersonaIdForStore, primaryPersonaConfidence);
        useVisitorStore.getState().processQuizDataForLeadScoring(get().answers, determinedPersonaIdForStore, primaryPersonaConfidence);

        trackQuizEvent('completed', { context: 'quiz', result, scores: finalScores, email: get().email });

        console.log("SHADOW FUNNEL: Behavioral score updated based on quiz results.", finalScores);
        if (primaryPersonaForState) {
            console.log("SHADOW FUNNEL: Retargeting pixel fired for persona:", primaryPersonaForState.title);
        }
      },

      resetQuiz: () => {
        set({
          currentStep: 0,
          email: '',
          hasConsented: false,
          answers: {},
          scores: { ...initialScores },
          quizCompleted: false,
          quizResult: null,
          isLoading: false,
        });
        localStorage.removeItem('quiz-storage'); // Ensure quiz-storage is also cleared for full reset
        trackQuizEvent('reset', { context: 'quiz' });
      },

      loadState: (persistedState) => {
        const scoresWithDefaults = { ...initialScores, ...(persistedState.scores || {}) };
        set({...persistedState, scores: scoresWithDefaults});
      }
    }),
    {
      name: 'quiz-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loadState(state); // This will merge initialScores with persisted scores
          console.log("Quiz state rehydrated from localStorage");
          if (state.email && state.currentStep > 0 && state.currentStep < state.totalSteps && !state.quizCompleted) {
            trackQuizEvent('abandoned_on_load', { context: 'quiz', email: state.email, lastStep: state.currentStep });
          }
        }
      }
    }
  )
);

let exitIntentDetectedForQuiz = false; // Renamed to avoid conflict if this file is ever merged/used elsewhere
const handleQuizMouseOut = (event: MouseEvent) => {
    const state = useQuizStore.getState();
    if (event.clientY <= 0 && state.currentStep > 0 && state.currentStep < state.totalSteps && !exitIntentDetectedForQuiz && !state.quizCompleted) {
      trackQuizEvent('exit_intent_detected', { context: 'quiz', email: state.email, currentStep: state.currentStep });
      exitIntentDetectedForQuiz = true; // Set flag to prevent multiple triggers per session/load
    }
};

if (typeof window !== 'undefined') {
    document.addEventListener('mouseout', handleQuizMouseOut);
}


export default useQuizStore;
