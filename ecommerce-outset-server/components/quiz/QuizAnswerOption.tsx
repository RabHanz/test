
import React from 'react';
import { motion } from 'framer-motion';
import type { QuizAnswerOption as QuizAnswerOptionType } from '../../types';

interface QuizAnswerOptionProps {
  option: QuizAnswerOptionType;
  onSelect: () => void;
  index: number;
}

const QuizAnswerOption: React.FC<QuizAnswerOptionProps> = ({ option, onSelect, index }) => {
  const { icon: Icon } = option; // Correctly destructure 'icon' as 'Icon'

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center text-left p-3 md:p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      {Icon && <Icon className="w-5 h-5 mr-3 text-orange-400 flex-shrink-0" aria-hidden="true" />}
      <span className="text-gray-100 text-sm md:text-base">{option.text}</span>
    </motion.button>
  );
};

export default QuizAnswerOption;
