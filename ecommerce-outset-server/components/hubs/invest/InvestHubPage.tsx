"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import InvestHeroSection from './InvestHeroSection';
import DueDiligenceSystemSection from './DueDiligenceSystemSection';
import ValuationMethodologySection from './ValuationMethodologySection';
import RiskAssessmentFrameworkSection from './RiskAssessmentFrameworkSection';
import PortfolioManagementSystemSection from './PortfolioManagementSystemSection';
import InvestmentOpportunitiesSection from './InvestmentOpportunitiesSection';
import InvestServicePathwaySection from './InvestServicePathwaySection';
import InvestAnalyticalToolsSection from './InvestAnalyticalToolsSection';
import InvestorNetworkSection from './InvestorNetworkSection';
// import useInvestHubStore from '../../store/investHubStore'; // If needed

const InvestHubPage: React.FC = () => {
  useEffect(() => {
    document.title = "Invest Hub - Ecommerce Outset";
    window.scrollTo(0, 0); 
    console.log('InvestHubPage mounted');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-gray-100" 
    >
      <InvestHeroSection />
      <DueDiligenceSystemSection />
      <ValuationMethodologySection />
      <RiskAssessmentFrameworkSection />
      <PortfolioManagementSystemSection />
      <InvestmentOpportunitiesSection />
      <InvestAnalyticalToolsSection />
      <InvestServicePathwaySection />
      <InvestorNetworkSection />
    </motion.div>
  );
};

export default InvestHubPage;
