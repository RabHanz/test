import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressBarProps {
  currentStep: number; // Current question number (1-indexed)
  totalSteps: number;  // Total number of questions
}

const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ currentStep, totalSteps }) => {
  // Progress is based on current question relative to total questions.
  // currentStep here is 1 for Q1, 2 for Q2, etc.
  // totalSteps is QUIZ_QUESTIONS.length
  const progressPercentage = Math.max(0, Math.min(100, ((currentStep -1) / totalSteps) * 100));
  // Show "Step X of Y" where X is current question number and Y is total questions
  const displayStep = Math.min(currentStep, totalSteps);


  return (
    <div className="w-full bg-gray-700 h-auto sticky top-0 z-10"> {/* Changed h-3 to h-auto for text */}
      <motion.div
        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2" // Progress bar height
        initial={{ width: '0%' }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="text-center text-xs text-gray-300 py-1">
        Question {displayStep} of {totalSteps} 
      </div>
    </div>
  );
};

export default QuizProgressBar;