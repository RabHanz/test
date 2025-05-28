
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { INVEST_RISK_FACTORS } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { ShieldCheckIcon } from '../../icons';
import FinancialToolStub from './shared/FinancialToolStub';

const RiskAssessmentFrameworkSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="3. Comprehensive Risk Assessment" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<ShieldCheckIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Identify and mitigate potential risks associated with Amazon business investments. Our framework covers platform, market, operational, financial, and regulatory compliance.
      </p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Key Risk Categories & Factors:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INVEST_RISK_FACTORS.map(factor => (
            <div key={factor.id} className="bg-gray-800 p-4 rounded-md shadow border border-yellow-700/20">
              <h4 className="text-sm font-semibold text-yellow-300">{factor.name}</h4>
              <p className="text-xs text-yellow-200 mb-1">{factor.category}</p>
              {factor.mitigationStrategy && <p className="text-xs text-gray-400">Mitigation: {factor.mitigationStrategy}</p>}
            </div>
          ))}
        </div>
      </div>
      <FinancialToolStub
        title="Interactive Risk Assessment Matrix"
        description="Score potential investments against various risk factors and visualize the overall risk profile."
        ctaText="Use Risk Matrix Tool"
        onCtaClick={() => trackInvestHubEvent('risk_matrix_tool_opened')}
        accentColorClass="yellow"
      />
    </SectionWrapper>
  );
};

export default RiskAssessmentFrameworkSection;