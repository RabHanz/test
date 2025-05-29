
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../Button';
import { MASTER_HERO_PROPS } from '../../../constants';
import { trackCTAClick, trackMasterHubEvent } from '../../../utils/trackingUtils';
import { BrainIcon, CheckCircleIcon } from '../../icons'; // Example icons

const MasterHeroSection: React.FC = () => {
  const { headline, subheadline, ctaText, ctaHref } = MASTER_HERO_PROPS;

  // Placeholder for dynamic data
  const learningPathProgress = 40; // Example: 40%
  const knowledgeConfidence = 75; // Example: 75/100

  return (
    <section className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-gray-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <BrainIcon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-xl mx-auto">
          {subheadline}
        </p>
        
        <Button 
          variant="custom"
          customColorClass="bg-orange-500 hover:bg-orange-600" // Main CTA color
          size="lg"
          onClick={() => {
            trackCTAClick(ctaText);
            trackMasterHubEvent('take_knowledge_assessment_clicked');
            window.location.href = ctaHref; 
          }}
          className="text-lg shadow-xl hover:shadow-orange-400/50"
        >
          {ctaText}
        </Button>

        {/* Learning Path Visualization & Knowledge Meter Stub */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto">
            <div>
                <p className="text-sm text-purple-200 mb-2">Your Learning Path Progress (Example):</p>
                <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div 
                    className="bg-purple-400 h-3 rounded-full"
                    style={{ width: `${learningPathProgress}%` }}
                    initial={{ width: '0%'}}
                    animate={{ width: `${learningPathProgress}%`}}
                    transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
                 <p className="text-xs text-purple-300 mt-1">{learningPathProgress}% of Core Concepts Covered</p>
            </div>
            <div>
                <p className="text-sm text-purple-200 mb-2">Knowledge Confidence Meter (Example):</p>
                 <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div 
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: `${knowledgeConfidence}%` }}
                    initial={{ width: '0%'}}
                    animate={{ width: `${knowledgeConfidence}%`}}
                    transition={{ duration: 1, delay: 0.7 }}
                    />
                </div>
                <p className="text-xs text-purple-300 mt-1">{knowledgeConfidence}/100 Confidence Score</p>
            </div>
        </div>
        <p className="text-xs text-purple-300 mt-4">Visualizations are illustrative. Actual progress tracked in your dashboard.</p>

      </motion.div>
    </section>
  );
};

export default MasterHeroSection;