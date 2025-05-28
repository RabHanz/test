
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizState, UserAnswers, PersonaId, QuizResult, Persona as PersonaType } from '../types';
import { QUIZ_QUESTIONS, PERSONAS_DATA } from '../constants';
import { trackQuizEvent } from '../utils/trackingUtils'; // Updated Import
import useVisitorStore from './visitorStore'; // For CRM lead scoring

const initialScores = PERSONAS_DATA.reduce((acc, persona) => {
  acc[persona.id as PersonaId] = 0;
  return acc;
}, {} as Record<PersonaId, number>);

if (!initialScores['unknown']) {
  initialScores['unknown'] = 0;
}


const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentStep: 0, // 0: Welcome, 1: Email, 2-11: Questions, 12: Results
      totalSteps: 1 + QUIZ_QUESTIONS.length + 1, // Email + Questions + Results
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
        trackQuizEvent('email_submitted', { email: get().email }); // Changed 'quiz_email_submitted' to 'email_submitted' to match general tracking event names better
        set({ currentStep: 1 }); // Move to first question after email
      },

      answerQuestion: (questionId, answerId, questionScores) => {
        const newAnswers = { ...get().answers, [questionId]: answerId };
        const newScores = { ...get().scores };
        questionScores.forEach(scoreEntry => {
          newScores[scoreEntry.personaId] = (newScores[scoreEntry.personaId] || 0) + scoreEntry.points;
        });

        set({ answers: newAnswers, scores: newScores });
        trackQuizEvent('question_answered', { questionId, answerId, currentScores: newScores }); // Changed 'quiz_question_answered'
        get().goToNextStep();
      },

      skipQuestion: (questionId) => {
        trackQuizEvent('question_skipped', { questionId }); // Changed 'quiz_question_skipped'
        get().goToNextStep();
      },

      goToNextStep: () => {
        const currentStep = get().currentStep;
        const totalQuestions = QUIZ_QUESTIONS.length;
        if (currentStep < totalQuestions +1) { // +1 for email step
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
            if (typeof score === 'number') {
                validScoredPersonas.push({ id: personaIdKey, score });
                if (personaIdKey !== 'unknown' && personaIdKey !== 'default_exit' && score > highestScore) {
                    highestScore = score;
                    primaryPersonaId = personaIdKey;
                }
            }
        }

        const primaryPersonaFromData = personasData.find(p => p.id === primaryPersonaId) || null;

        const allNumericScores = Object.values(finalScores).filter(s => typeof s === 'number') as number[];
        const totalScoreSum = allNumericScores.reduce((sum, s) => sum + s, 0);

        let primaryPersonaForState: PersonaType | null = null;
        if (primaryPersonaFromData) {
            const primaryScore = finalScores[primaryPersonaFromData.id as PersonaId];
            const confidence = (typeof primaryScore === 'number' && totalScoreSum > 0)
                ? Math.round((primaryScore / totalScoreSum) * 100)
                : 0;
            primaryPersonaForState = {
                ...primaryPersonaFromData,
                memberCount: `${confidence}% Match`
            };
        }

        const secondaryPersonasResult = validScoredPersonas
            .filter(sp => {
                const score = sp.score;
                return sp.id !== primaryPersonaId && sp.id !== 'unknown' && sp.id !== 'default_exit' && score > (highestScore * 0.4) && score > 5;
            })
            .sort((a, b) => b.score - a.score)
            .map(sp => personasData.find(p => p.id === sp.id))
            .filter(p => p !== null) as PersonaType[];


        const allScoresForDisplay: QuizResult['allScores'] = validScoredPersonas
            .sort((a,b) => b.score - a.score)
            .map(sp => ({
                personaId: sp.id,
                score: sp.score,
                confidence: totalScoreSum > 0 ? Math.round((sp.score / totalScoreSum) * 100) : 0
            }));

        const result: QuizResult = { primaryPersona: primaryPersonaForState, secondaryPersonas: secondaryPersonasResult, allScores: allScoresForDisplay };
        set({ quizResult: result, quizCompleted: true, isLoading: false, currentStep: get().totalSteps });
        trackQuizEvent('completed', { result, scores: finalScores, email: get().email }); // Changed 'quiz_completed'

        const personaIdForScoring = primaryPersonaForState ? primaryPersonaForState.id as PersonaId : 'unknown';
        useVisitorStore.getState().processQuizDataForLeadScoring(get().answers, personaIdForScoring);


        console.log("SHADOW FUNNEL: Behavioral score updated based on quiz results.", finalScores);
        console.log("SHADOW FUNNEL: Retargeting pixel fired for persona:", primaryPersonaForState?.title);
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
        localStorage.removeItem('quiz-storage');
        trackQuizEvent('reset'); // Changed 'quiz_reset'
      },

      loadState: (persistedState) => {
        set(persistedState);
      }
    }),
    {
      name: 'quiz-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.loadState(state);
        console.log("Quiz state rehydrated from localStorage");
        if (state && state.email && state.currentStep > 0 && state.currentStep < state.totalSteps && !state.quizCompleted) {
            trackQuizEvent('abandoned_on_load', { email: state.email, lastStep: state.currentStep }); // Changed 'quiz_abandoned_on_load'
        }
      }
    }
  )
);

let exitIntentDetected = false;
const handleQuizMouseOut = (event: MouseEvent) => {
    const state = useQuizStore.getState();
    if (event.clientY <= 0 && state.currentStep > 0 && state.currentStep < state.totalSteps && !exitIntentDetected && !state.quizCompleted) {
      trackQuizEvent('exit_intent_detected', { email: state.email, currentStep: state.currentStep }); // Changed 'quiz_exit_intent_detected'
      exitIntentDetected = true;
    }
};

if (typeof window !== 'undefined') {
    document.addEventListener('mouseout', handleQuizMouseOut);
}


export default useQuizStore;
