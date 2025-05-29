
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MasterHeroSection from './MasterHeroSection';
import AmazonEcosystemModelSection from './AmazonEcosystemModelSection';
import ConceptualFrameworkLibrarySection from './ConceptualFrameworkLibrarySection';
import ImplementationBridgeSystemSection from './ImplementationBridgeSystemSection';
import KnowledgeProgressionTrackingSection from './KnowledgeProgressionTrackingSection';
import MasteryVerificationSection from './MasteryVerificationSection';
import MasterServiceIntegrationSection from './MasterServiceIntegrationSection';
import MasterInteractiveLearningToolsSection from './MasterInteractiveLearningToolsSection';
import MasterCommunityLearningSection from './MasterCommunityLearningSection';
// import useMasterHubStore from '../../store/masterHubStore'; // If needed

const MasterHubPage: React.FC = () => {
  useEffect(() => {
    document.title = "Master Hub - Ecommerce Outset";
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-100" // Base styling for the hub page
    >
      <MasterHeroSection />
      <AmazonEcosystemModelSection />
      <ConceptualFrameworkLibrarySection />
      <ImplementationBridgeSystemSection />
      <KnowledgeProgressionTrackingSection />
      <MasteryVerificationSection />
      <MasterInteractiveLearningToolsSection />
      <MasterServiceIntegrationSection />
      <MasterCommunityLearningSection />
    </motion.div>
  );
};

export default MasterHubPage;
