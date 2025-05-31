
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ConnectHeroSection from './ConnectHeroSection';
import ExpertiseShowcaseSystemSection from './ExpertiseShowcaseSystemSection';
import ClientAcquisitionArchitectureSection from './ClientAcquisitionArchitectureSection';
import ValueDemonstrationFrameworkSection from './ValueDemonstrationFrameworkSection';
import PremiumPositioningSystemSection from './PremiumPositioningSystemSection';
import ClientConnectionOpportunitiesSection from './ClientConnectionOpportunitiesSection';
import ConnectServicePathwaySection from './ConnectServicePathwaySection';
import BusinessDevelopmentToolsSection from './BusinessDevelopmentToolsSection';
import ProviderCommunitySection from './ProviderCommunitySection';
// import useConnectHubStore from '../../store/connectHubStore'; // If needed

const ConnectHubPage: React.FC = () => {
  useEffect(() => {
    document.title = "Connect Hub - Ecommerce Outset";
    window.scrollTo(0, 0); 
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-100" 
    >
      <ConnectHeroSection />
      <ExpertiseShowcaseSystemSection />
      <ClientAcquisitionArchitectureSection />
      <ValueDemonstrationFrameworkSection />
      <PremiumPositioningSystemSection />
      <ClientConnectionOpportunitiesSection />
      <BusinessDevelopmentToolsSection />
      <ConnectServicePathwaySection />
      <ProviderCommunitySection />
    </motion.div>
  );
};

export default ConnectHubPage;
