import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import LaunchHeroSection from './LaunchHeroSection';
import ProductSelectionFrameworkSection from './ProductSelectionFrameworkSection';
import LaunchSequenceRoadmapSection from './LaunchSequenceRoadmapSection';
import RiskReductionProtocolsSection from './RiskReductionProtocolsSection';
import ImplementationToolsSection from './ImplementationToolsSection';
import LaunchSuccessStoriesSection from './LaunchSuccessStoriesSection';
import LaunchServiceIntegrationSection from './LaunchServiceIntegrationSection';
import LaunchCommunityFeaturesSection from './LaunchCommunityFeaturesSection';
// import useLaunchHubStore from '../../store/launchHubStore'; // If needed for specific page logic

const LaunchHubPage: React.FC = () => {
  // const {} = useLaunchHubStore(); // Example: if you need to trigger something on page load

  useEffect(() => {
    document.title = "Launch Hub - Ecommerce Outset";
    window.scrollTo(0, 0); // Scroll to top on page load
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-100" // Base styling for the hub page
    >
      <LaunchHeroSection />
      <ProductSelectionFrameworkSection />
      <LaunchSequenceRoadmapSection />
      <RiskReductionProtocolsSection />
      <ImplementationToolsSection />
      <LaunchSuccessStoriesSection />
      <LaunchServiceIntegrationSection />
      <LaunchCommunityFeaturesSection />
      {/* Add specific exit-intent or other modals if needed for this hub */}
    </motion.div>
  );
};

export default LaunchHubPage;
