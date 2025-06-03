"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ScaleHeroSection from './ScaleHeroSection';
import BusinessDiagnosticSystemSection from './BusinessDiagnosticSystemSection';
import OperationalExcellenceFrameworksSection from './OperationalExcellenceFrameworksSection';
import RevenueOptimizationSystemsSection from './RevenueOptimizationSystemsSection';
import ScalingInfrastructureSection from './ScalingInfrastructureSection';
import ScaleCaseStudyShowcaseSection from './ScaleCaseStudyShowcaseSection';
import ScaleServicePathwaySection from './ScaleServicePathwaySection';
import ScaleInteractiveToolsSection from './ScaleInteractiveToolsSection';
import ScaleMastermindIntegrationSection from './ScaleMastermindIntegrationSection';
// import useScaleHubStore from '../../store/scaleHubStore'; // If needed

const ScaleHubPage: React.FC = () => {
  useEffect(() => {
    document.title = "Scale Hub - Ecommerce Outset";
    window.scrollTo(0, 0);
    console.log('ScaleHubPage mounted');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-100"
    >
      <ScaleHeroSection />
      <BusinessDiagnosticSystemSection />
      <OperationalExcellenceFrameworksSection />
      <RevenueOptimizationSystemsSection />
      <ScalingInfrastructureSection />
      <ScaleCaseStudyShowcaseSection />
      <ScaleInteractiveToolsSection />
      <ScaleServicePathwaySection />
      <ScaleMastermindIntegrationSection />
    </motion.div>
  );
};

export default ScaleHubPage;