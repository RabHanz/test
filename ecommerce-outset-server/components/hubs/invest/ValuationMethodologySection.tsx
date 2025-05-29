
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { INVEST_VALUATION_MODELS } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { CalculatorIcon } from '../../icons';
import FinancialToolStub from './shared/FinancialToolStub';

const ValuationMethodologySection: React.FC = () => {
  return (
    <SectionWrapper 
      title="2. Advanced Valuation Methodology" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<CalculatorIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Accurately value Amazon businesses using our multi-factor models, industry benchmarks, and risk-adjusted calculations. Understand true growth potential and exit opportunities.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
        {INVEST_VALUATION_MODELS.map(model => (
          <div key={model.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-700/30">
            <h3 className="text-lg font-semibold text-yellow-300 mb-1">{model.name}</h3>
            <p className="text-xs text-yellow-200 mb-2 uppercase">{model.type}</p>
            <p className="text-sm text-gray-400">{model.description}</p>
          </div>
        ))}
      </div>
      <FinancialToolStub
        title="Interactive Valuation Calculator"
        description="Input key business metrics to get an estimated valuation range based on our models. Includes sensitivity analysis."
        ctaText="Launch Valuation Tool"
        onCtaClick={() => trackInvestHubEvent('valuation_calculator_opened')}
        accentColorClass="yellow"
      />
    </SectionWrapper>
  );
};

export default ValuationMethodologySection;