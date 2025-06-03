'use client';

import React, { createContext, useContext, useState } from 'react';
import { useVisitorStore } from '@/lib/store/visitorStore';

interface QuizContextType {
  isQuizModalOpen: boolean;
  setIsQuizModalOpen: (open: boolean) => void;
  closeQuizModal: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const { logInteraction } = useVisitorStore();

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
    logInteraction('quiz_modal_closed');
  };

  return (
    <QuizContext.Provider
      value={{
        isQuizModalOpen,
        setIsQuizModalOpen,
        closeQuizModal,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
} 