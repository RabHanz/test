
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../Button';
import { SCALE_HERO_PROPS } from '../../../constants';
import { trackCTAClick, trackScaleHubEvent } from '../../../utils/trackingUtils';
import MetricDisplayStub from './shared/MetricDisplayStub'; // For Business Health Indicator
import type { ScaleHeroStat } from '../../../types';

const ScaleHeroSection: React.FC = () => {
  const { headline, subheadline, stats, ctaText, ctaHref } = SCALE_HERO_PROPS;

  // Stubbed Business Health Score
  const businessHealthScore = 78; // Example score

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-sky-700 to-gray-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-blue-200">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center text-sm sm:text-base">
                {Icon && <Icon className="w-5 h-5 mr-2 text-blue-300"/>}
                <strong>{stat.value}</strong><span className="ml-1">{stat.label}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mb-10">
             <MetricDisplayStub 
                title="Your Business Health Score (Example)"
                value={`${businessHealthScore}/100`}
                status={businessHealthScore > 70 ? 'Good' : businessHealthScore > 50 ? 'Average' : 'Needs Attention'}
                statusColorClass={businessHealthScore > 70 ? 'text-green-400' : businessHealthScore > 50 ? 'text-yellow-400' : 'text-red-400'}
             />
        </div>

        <Button 
          variant="custom"
          customColorClass="bg-orange-500 hover:bg-orange-600"
          size="lg"
          onClick={() => {
            trackCTAClick(ctaText);
            trackScaleHubEvent('get_business_diagnostic_clicked');
            window.location.href = ctaHref; 
          }}
          className="text-lg shadow-xl hover:shadow-orange-400/50"
        >
          {ctaText}
        </Button>

      </motion.div>
    </section>
  );
};

export default ScaleHeroSection;