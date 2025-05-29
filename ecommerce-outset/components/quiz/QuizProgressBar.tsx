
import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressBarProps {
  currentStep: number; // Current step in the overall quiz flow (1 for Q1, etc.)
  totalQuestions: number;  // Total number of questions
  progressCurrentStep: number; // 0-indexed current question for progress bar (e.g. 0 for Q1)
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ currentStep, totalQuestions, progressCurrentStep }) => {
  // Ensure progressCurrentStep is within bounds [0, totalQuestions]
  const boundedProgressStep = Math.max(0, Math.min(progressCurrentStep, totalQuestions));
  const progressPercentage = totalQuestions > 0 ? (boundedProgressStep / totalQuestions) * 100 : 0;
  
  // Display step is 1-indexed for users
  const displayStep = Math.min(currentStep, totalQuestions); // currentStep is 1-indexed from PersonaQuiz (1=Q1)

  return (
    <div 
        className="w-full bg-gray-700 h-auto sticky top-0 z-10"
        role="progressbar"
        aria-valuenow={boundedProgressStep} // 0-indexed current question for ARIA
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuetext={`Question ${displayStep} of ${totalQuestions}`}
    >
      <motion.div
        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2" 
        initial={{ width: '0%' }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="text-center text-xs text-gray-300 py-1" aria-hidden="true"> {/* Textual info for sighted users */}
        Question {displayStep} of {totalQuestions} 
      </div>
    </div>
  );
};

export default QuizProgressBar;
