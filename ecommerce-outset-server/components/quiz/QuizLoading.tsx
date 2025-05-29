
import React from 'react';
import { motion } from 'framer-motion';

interface QuizLoadingProps {
  text?: string;
}

const QuizLoading: React.FC<QuizLoadingProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <motion.div
        className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-gray-300 mt-4 text-lg">{text}</p>
    </div>
  );
};

export default QuizLoading;
