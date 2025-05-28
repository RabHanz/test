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
    return () => {
      // Example: if (currentStep > 0 && currentStep < totalSteps && !quizCompleted) {
      //   trackQuizEvent('quiz_closed_prematurely', { lastStep: currentStep });
      // }
    };
  }, [currentStep, totalSteps, quizCompleted]);

  const renderStep = () => {
    if (isLoading) return <QuizLoading />;

    if (currentStep === 0) {
      return <QuizWelcomeScreen />;
    }
    
    if (currentStep > 0 && currentStep <= QUIZ_QUESTIONS.length) {
      const questionIndex = currentStep - 1;
      return <QuizQuestionCard question={QUIZ_QUESTIONS[questionIndex]} questionNumber={currentStep} totalQuestions={QUIZ_QUESTIONS.length} />;
    }
    if (quizCompleted && quizResult && currentStep === totalSteps) {
      return <QuizResultsPage result={quizResult} onRetake={resetQuiz} onClose={onClose} />;
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
    <div className="flex flex-col h-full bg-gray-800 text-white relative">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"
        aria-label="Close quiz"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      {currentStep > 0 && currentStep <= totalSteps && !quizCompleted && ( // Show progress bar only during questions
        <QuizProgressBar currentStep={currentStep} totalSteps={QUIZ_QUESTIONS.length + 1} /> // Adjust total steps for progress bar to be question-focused
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