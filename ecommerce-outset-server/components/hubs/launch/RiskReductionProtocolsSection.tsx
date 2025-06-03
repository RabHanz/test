import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import ChecklistItem from './shared/ChecklistItem'; // Assuming this is a simple display component for now
import { RISK_REDUCTION_PROTOCOLS } from '../../../constants';
import { ShieldCheckIcon } from '../../icons';

const RiskReductionProtocolsSection: React.FC = () => {
  return (
    <SectionWrapper title="3. Risk Reduction Protocols" className="bg-gray-850 py-12 md:py-16" actions={<ShieldCheckIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Minimize potential pitfalls and protect your investment with our comprehensive risk reduction strategies, covering everything from supplier verification to account safety.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {RISK_REDUCTION_PROTOCOLS.map(protocol => (
          <ChecklistItem 
            key={protocol.id}
            label={protocol.name}
            description={protocol.description}
            // isCompleted={false} // This would come from store in future
            // onToggle={() => {}} // This would update store in future
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-8 text-center">
        Each protocol includes detailed guides and actionable steps.
      </p>
    </SectionWrapper>
  );
};

export default RiskReductionProtocolsSection;
