
import React from 'react';
// import { motion } from 'framer-motion'; // Already removed
import useVisitorStore from '../../store/visitorStore';
// import { CheckCircleIcon } from '../icons'; // Icon removed

const LeadInfoDisplay: React.FC = () => {
  const { leadScore, leadStage } = useVisitorStore(state => ({
    leadScore: state.leadScore,
    leadStage: state.leadStage,
  }));

  const scoreDetail = (label: string, value: number | undefined) => (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-200">{value === undefined ? 'N/A' : value.toFixed(0)}</span>
    </div>
  );

  return (
    <div // Changed from motion.div
      // initial={{ opacity: 0, x: 100 }} // Framer motion prop
      // animate={{ opacity: 1, x: 0 }} // Framer motion prop
      // transition={{ duration: 0.5, delay: 1 }} // Framer motion prop
      className="fixed bottom-4 right-4 bg-gray-800 bg-opacity-90 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-lg p-4 w-64 z-[200] text-white"
      role="status"
      aria-live="polite"
    >
      <h3 className="text-sm font-semibold text-orange-400 mb-2 border-b border-gray-700 pb-1">
        {/* <CheckCircleIcon className="w-4 h-4 inline mr-1 align-text-bottom" /> Icon removed */} Developer: Lead Status
      </h3>
      <div className="space-y-1.5">
        {scoreDetail("Behavioral Score", leadScore.behavioralScore.currentTotal)}
        {scoreDetail("Demographic Score", leadScore.demographicScore.currentTotal)}
        {scoreDetail("Engagement Score", leadScore.engagementQualityScore.currentTotal)}
        <div className="flex justify-between text-sm pt-1 mt-1 border-t border-gray-700">
          <span className="text-gray-300 font-semibold">Total Score:</span>
          <span className="font-bold text-orange-300">{leadScore.totalScore.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300 font-semibold">Lead Stage:</span>
          <span className="font-bold text-orange-300">{leadStage}</span>
        </div>
      </div>
       <button 
        onClick={() => useVisitorStore.getState().resetVisitorProfile()}
        className="mt-3 text-xs bg-red-700 hover:bg-red-600 text-white py-1 px-2 rounded w-full transition-colors"
      >
        Reset Visitor Profile
      </button>
    </div>
  );
};

export default LeadInfoDisplay;