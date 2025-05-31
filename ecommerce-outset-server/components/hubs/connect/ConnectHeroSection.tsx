
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../Button';
import { CONNECT_HERO_PROPS } from '../../../constants';
import { trackCTAClick, trackConnectHubEvent } from '../../../utils/trackingUtils';
import ServiceToolStub from './shared/ServiceToolStub'; // Using a generic stub for display
import { HandshakeIcon, DollarSignIcon, CheckCircleIcon } from '../../icons';

const ConnectHeroSection: React.FC = () => {
  const { headline, subheadline, ctaText, ctaHref } = CONNECT_HERO_PROPS;

  // Placeholder data
  const clientQualityScore = 85; // Example score 0-100
  const avgProjectValue = 2500; // Example value in USD

  return (
    <section className="relative bg-gradient-to-br from-teal-600 via-cyan-700 to-gray-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HandshakeIcon className="w-16 h-16 text-teal-300 mx-auto mb-4" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
           <ServiceToolStub 
                title="Client Quality Score (Example)"
                value={`${clientQualityScore}/100`}
                description="Based on ideal client profile match"
                icon={CheckCircleIcon}
                accentColorClass="teal"
                ctaText="Improve Score"
                onCtaClick={() => trackConnectHubEvent('improve_client_quality_score_clicked')}
            />
            <ServiceToolStub 
                title="Average Project Value (Example)"
                value={`$${avgProjectValue.toLocaleString()}`}
                description="Indicator of premium client attraction"
                icon={DollarSignIcon}
                accentColorClass="teal"
                ctaText="Increase Value"
                onCtaClick={() => trackConnectHubEvent('increase_avg_project_value_clicked')}
            />
        </div>

        <Button 
          variant="custom"
          customColorClass="bg-orange-500 hover:bg-orange-600" 
          size="lg"
          onClick={() => {
            trackCTAClick(ctaText);
            trackConnectHubEvent('complete_service_assessment_clicked');
            window.location.href = ctaHref; 
          }}
          className="text-lg shadow-xl hover:shadow-orange-400/50"
        >
          {ctaText}
        </Button>
         <p className="text-xs text-teal-200 mt-4">Showcase your expertise and attract the clients you deserve.</p>
      </motion.div>
    </section>
  );
};

export default ConnectHeroSection;