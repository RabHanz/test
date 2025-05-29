
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useQuizStore from '../../store/quizStore';
import { QUIZ_QUESTIONS } from '../../constants'; // Import QUIZ_QUESTIONS
import QuizWelcomeScreen from './QuizWelcomeScreen';
import QuizQuestionCard from './QuizQuestionCard';
import QuizResultsPage from './QuizResultsPage';
import QuizProgressBar from './QuizProgressBar';
import QuizLoading from './QuizLoading';
import { CloseIcon } from '../icons';

interface PersonaQuizProps {
  onClose: () => void;
}

const PersonaQuiz: React.FC<PersonaQuizProps> = ({ onClose }) => {
  const {
    currentStep,
    totalSteps,
    isLoading,
    quizCompleted,
    quizResult,
    resetQuiz 
  } = useQuizStore();

  useEffect(() => {
    // Focus management: when the quiz opens, focus should be trapped inside.
    // On close, focus should return to the element that opened it.
    // This is complex and often requires a dedicated focus-trap library.
    // For now, we'll ensure the modal itself is announced.
    const previouslyFocusedElement = document.activeElement as HTMLElement;
    return () => {
      // Example: if (currentStep > 0 && currentStep < totalSteps && !quizCompleted) {
      //   trackQuizEvent('quiz_closed_prematurely', { lastStep: currentStep });
      // }
      previouslyFocusedElement?.focus();
    };
  }, []); // Run once on mount/unmount

  const renderStep = () => {
    if (isLoading) return <QuizLoading />;

    // Quiz title ID for aria-labelledby
    const quizTitleId = "persona-quiz-title";

    if (currentStep === 0) {
      return <QuizWelcomeScreen quizTitleId={quizTitleId} />;
    }
    
    if (currentStep > 0 && currentStep <= QUIZ_QUESTIONS.length) {
      const questionIndex = currentStep - 1;
      return <QuizQuestionCard question={QUIZ_QUESTIONS[questionIndex]} questionNumber={currentStep} totalQuestions={QUIZ_QUESTIONS.length} quizTitleId={quizTitleId}/>;
    }
    if (quizCompleted && quizResult && currentStep === totalSteps) {
      return <QuizResultsPage result={quizResult} onRetake={resetQuiz} onClose={onClose} quizTitleId={quizTitleId} />;
    }
    
    return <QuizLoading text="Preparing your results..." />;
  };
  
  const screenAnimation = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    // For modals, role="dialog", aria-modal="true", and aria-labelledby are important.
    <div 
      className="flex flex-col h-full bg-gray-800 text-white relative"
      role="dialog"
      aria-modal="true"
      aria-labelledby="persona-quiz-main-title" // A general title for the quiz modal
      // aria-describedby might point to a general description if one exists
    >
      {/* This h1 can be visually hidden but provide context to SR users for the whole dialog */}
      <h1 id="persona-quiz-main-title" className="sr-only">Amazon Seller Persona Quiz</h1>

      <button 
        type="button"
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 p-1 rounded-full focus:ring-2 focus:ring-white"
        aria-label="Close persona quiz"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      {currentStep > 0 && currentStep <= QUIZ_QUESTIONS.length + 1 && !quizCompleted && ( 
        <QuizProgressBar 
            currentStep={currentStep} 
            totalQuestions={QUIZ_QUESTIONS.length} // ProgressBar total based on questions
            // For quiz flow: Welcome (0), Q1 (1).. Q_N (N), Results (N+1)
            // So if currentStep is 1 (Q1), progress should be 0/N. If currentStep is N (last Q), progress is (N-1)/N
            progressCurrentStep={currentStep -1} // Adjust for 0-indexed progress
        />
      )}
      
      <div className="flex-grow overflow-y-auto p-4 md:p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep} 
            initial={screenAnimation.initial}
            animate={screenAnimation.animate}
            exit={screenAnimation.exit}
            transition={screenAnimation.transition}
            className="h-full" 
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonaQuiz;
