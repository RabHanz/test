
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { INVEST_PORTFOLIO_TOOLS } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { ChartPieIcon } from '../../icons';
import FinancialToolStub from './shared/FinancialToolStub';

const PortfolioManagementSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="4. Portfolio Management System" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<ChartPieIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Optimize your Amazon business portfolio for long-term growth and returns. Utilize our frameworks for diversification, performance monitoring, rebalancing, and strategic exits.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
        {INVEST_PORTFOLIO_TOOLS.slice(0, 4).map(tool => ( // Show a few key tools
          <div key={tool.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-700/30">
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">{tool.name}</h3>
            <p className="text-xs text-yellow-200 mb-2 uppercase">{tool.type}</p>
            <p className="text-sm text-gray-400">{tool.description}</p>
          </div>
        ))}
      </div>
      <FinancialToolStub
        title="Consolidated Portfolio Dashboard"
        description="Connect your business data (conceptual) to track performance across all your Amazon investments in one place."
        ctaText="Access Portfolio Dashboard"
        onCtaClick={() => trackInvestHubEvent('portfolio_dashboard_opened')}
        accentColorClass="yellow"
      />
    </SectionWrapper>
  );
};

export default PortfolioManagementSystemSection;