
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../Button';
import { LAUNCH_HERO_PROPS } from '../../../constants';
import { trackCTAClick, trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { CheckCircleIcon } from '../../icons'; // For value props

const LaunchHeroSection: React.FC = () => {
  const { headline, subheadline, valueProps, ctaText, ctaHref } = LAUNCH_HERO_PROPS;

  // Placeholder for roadmap progress. In a real app, this would be dynamic.
  const roadmapProgress = 25; // Example: 25% progress

  return (
    <section className="relative bg-gradient-to-br from-green-600 via-emerald-700 to-gray-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40" aria-hidden="true"></div>
      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-xl mx-auto">
          {subheadline}
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10 text-green-200">
          {valueProps.map(prop => (
            <div key={prop} className="flex items-center text-sm sm:text-base">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-300" aria-hidden="true"/>
              {prop}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="custom"
          customColorClass="bg-orange-500 hover:bg-orange-600"
          size="lg"
          onClick={() => {
            trackCTAClick(ctaText);
            trackLaunchHubEvent('start_launch_assessment_clicked');
            window.location.href = ctaHref; // Or trigger a modal assessment
          }}
          className="text-lg shadow-xl hover:shadow-orange-400/50"
        >
          {ctaText}
        </Button>

        {/* 60-Day Roadmap Progress Indicator Stub */}
        <div className="mt-12 max-w-md mx-auto"
             role="progressbar"
             aria-valuenow={roadmapProgress}
             aria-valuemin={0}
             aria-valuemax={100}
             aria-label="60-Day Launch Roadmap Progress"
        >
          <p className="text-sm text-green-200 mb-2" id="roadmap-progress-label">Your 60-Day Launch Roadmap Progress:</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5" aria-hidden="true"> {/* Visual bar, actual value read by ARIA attributes on parent */}
            <motion.div
              className="bg-green-400 h-2.5 rounded-full"
              style={{ width: `${roadmapProgress}%` }}
              initial={{ width: '0%'}}
              animate={{ width: `${roadmapProgress}%`}}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-green-300 mt-1" aria-hidden="true">{roadmapProgress}% Complete (Example)</p>
        </div>

      </motion.div>
    </section>
  );
};

export default LaunchHeroSection;
