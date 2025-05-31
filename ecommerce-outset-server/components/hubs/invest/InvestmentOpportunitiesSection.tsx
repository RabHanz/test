
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { INVEST_OPPORTUNITIES } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { SearchIcon } from '../../icons'; // Using Search for 'finding opportunities'
import Button from '../../Button';

const InvestmentOpportunitiesSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Curated Investment Opportunities" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<SearchIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Access a curated selection of Amazon business investment opportunities from vetted sources. Leverage our criteria matching and expert evaluations to find your next acquisition. (Opportunities shown are illustrative).
      </p>
      <div className="space-y-6">
        {INVEST_OPPORTUNITIES.map(opp => (
          <div key={opp.id} className="bg-gray-800 p-6 rounded-xl shadow-xl border border-yellow-700/40 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
              <h3 className="text-xl font-bold text-yellow-300">{opp.name}</h3>
              <span className="text-xs bg-yellow-500 text-gray-900 font-semibold px-2 py-0.5 rounded-full mt-2 sm:mt-0">{opp.highlight}</span>
            </div>
            <p className="text-sm text-gray-400 mb-1"><strong className="text-gray-200">Category:</strong> {opp.category}</p>
            <p className="text-sm text-gray-400 mb-1"><strong className="text-gray-200">Asking Price:</strong> {opp.askingPriceRange}</p>
            <p className="text-sm text-gray-400 mb-3"><strong className="text-gray-200">SDE Multiple:</strong> {opp.sdeMultipleRange}</p>
            <p className="text-sm text-gray-300 mb-4">{opp.summary}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="!bg-yellow-600 hover:!bg-yellow-700 text-white"
              onClick={() => trackInvestHubEvent('view_deal_details_clicked', { deal_name: opp.name })}
            >
              View Details & Request Intro
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-8 text-center">
        Access to full deal flow and collaborative due diligence available to program members.
      </p>
    </SectionWrapper>
  );
};

export default InvestmentOpportunitiesSection;