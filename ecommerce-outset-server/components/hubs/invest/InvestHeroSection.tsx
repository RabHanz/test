
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../Button';
import { INVEST_HERO_PROPS } from '../../../constants';
import { trackCTAClick, trackInvestHubEvent } from '../../../utils/trackingUtils';
import FinancialToolStub from './shared/FinancialToolStub';
import { TrendingUpIcon, ShieldCheckIcon, BanknotesIcon } from '../../icons';

const InvestHeroSection: React.FC = () => {
  const { headline, subheadline, ctaText, ctaHref } = INVEST_HERO_PROPS;

  // Placeholder data
  const mockPortfolioReturn = "+18.7%";
  const mockRiskScore = "Low-Medium";

  return (
    <section className="relative bg-gradient-to-br from-yellow-600 via-amber-700 to-gray-900 text-white py-20 md:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <BanknotesIcon className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
          {subheadline}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
           <FinancialToolStub 
                title="Portfolio Performance Preview"
                value={mockPortfolioReturn}
                description="Simulated YTD Return"
                icon={TrendingUpIcon}
                accentColorClass="yellow"
            />
            <FinancialToolStub 
                title="Risk-Adjusted Return Calc."
                value={mockRiskScore}
                description="Based on EO Risk Model"
                icon={ShieldCheckIcon}
                accentColorClass="yellow"
                ctaText="Calculate Yours"
                onCtaClick={() => trackInvestHubEvent('risk_return_calc_hero_clicked')}
            />
        </div>

        <Button 
          variant="custom"
          customColorClass="bg-orange-500 hover:bg-orange-600" // Main CTA consistent with other hubs
          size="lg"
          onClick={() => {
            trackCTAClick(ctaText);
            trackInvestHubEvent('access_investment_assessment_clicked');
            window.location.href = ctaHref; 
          }}
          className="text-lg shadow-xl hover:shadow-orange-400/50"
        >
          {ctaText}
        </Button>
         <p className="text-xs text-yellow-200 mt-4">Unlock institutional-grade strategies for your Amazon investments.</p>
      </motion.div>
    </section>
  );
};

export default InvestHeroSection;