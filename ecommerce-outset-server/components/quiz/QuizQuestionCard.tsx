
import React from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '../../types';
import useQuizStore from '../../store/quizStore';
import QuizAnswerOptionComponent from './QuizAnswerOption'; // Renamed import to avoid conflict if any
import Button from '../Button';
// Import QUIZ_QUESTIONS from constants if needed for length, but totalQuestions prop is preferred for display
import { QUIZ_QUESTIONS as ALL_QUIZ_QUESTIONS_FROM_CONSTANTS } from '../../constants';


interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number; // This should be QUIZ_QUESTIONS.length from constants.ts
  quizTitleId?: string; // For aria-labelledby on the section
}

const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({ question, questionNumber, totalQuestions, quizTitleId }) => {
  const { answerQuestion, skipQuestion } = useQuizStore();

  const handleAnswerSelect = (answerId: string, scores: Array<{ personaId: any; points: number }>) => {
    answerQuestion(question.id, answerId, scores);
  };

  const handleSkip = () => {
    skipQuestion(question.id);
  };
  
  const questionId = `quiz-question-${question.id}`;

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-4 md:p-6 h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="group" // Semantically group the question and its answers
      aria-labelledby={questionId} // The question text itself labels this group
    >
      <p className="text-sm text-orange-400 mb-2">Question {questionNumber} of {totalQuestions}</p>
      <h2 id={questionId} className="text-xl md:text-2xl font-semibold text-white text-center mb-6 md:mb-8">
        {question.questionText}
      </h2>
      
      <div className="w-full max-w-lg space-y-3 md:space-y-4">
        {question.options.map((option, index) => (
          <QuizAnswerOptionComponent // Use renamed import
            key={option.id}
            option={option}
            onSelect={() => handleAnswerSelect(option.id, option.scores)}
            index={index}
          />
        ))}
      </div>

      {question.skippable && (
        <Button 
          type="button"
          variant="secondary" 
          onClick={handleSkip}
          className="mt-8 text-sm"
          size="sm"
        >
          {question.isSensitive ? "Prefer not to say / Skip" : "Skip this question"}
        </Button>
      )}
    </motion.div>
  );
};

export default QuizQuestionCard;
