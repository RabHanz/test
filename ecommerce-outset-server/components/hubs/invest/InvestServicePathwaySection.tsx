
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { INVEST_SERVICE_TIERS } from '../../../constants';
import { trackCTAClick, trackInvestHubEvent } from '../../../utils/trackingUtils';
import { DollarSignIcon, CheckCircleIcon as FeatureIcon } from '../../icons';

const InvestServicePathwaySection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Your Path to Portfolio Success" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<DollarSignIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Select the EO Invest program that aligns with your investment goals, from foundational due diligence to comprehensive portfolio mastery.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {INVEST_SERVICE_TIERS.map(tier => (
          <div key={tier.id} className={`bg-gray-800 p-6 rounded-xl shadow-xl border-2 ${tier.id === 'iso' ? 'border-yellow-500 scale-105' : 'border-yellow-700'} flex flex-col`}>
            {tier.id === 'iso' && <div className="text-center mb-3"><span className="bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">MOST POPULAR</span></div>}
            <h3 className="text-2xl font-bold text-yellow-300 mb-2 text-center">{tier.name}</h3>
            <p className="text-3xl font-extrabold text-white mb-3 text-center">{tier.price}</p>
            <p className="text-sm text-gray-400 mb-5 text-center flex-grow">{tier.description}</p>
            
            <h5 className="text-sm font-semibold text-white mb-2">Key Features:</h5>
            <ul className="space-y-1.5 text-xs text-gray-300 mb-5 flex-grow">
              {tier.features.slice(0,3).map(feature => (
                <li key={feature} className="flex items-start">
                  <FeatureIcon className="w-3.5 h-3.5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0"/> {feature}
                </li>
              ))}
               {tier.features.length > 3 && <li className="pl-5">+ {tier.features.length-3} more...</li>}
            </ul>

            <Button 
              variant="custom"
              customColorClass={tier.id === 'iso' ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' : 'bg-orange-500 hover:bg-orange-600 text-white'}
              size="md" 
              className="w-full mt-auto"
              onClick={() => {
                trackCTAClick(`Explore ${tier.name} (Invest)`);
                trackInvestHubEvent('invest_service_explore_clicked', { tier_name: tier.name });
              }}
            >
              Explore {tier.name}
            </Button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default InvestServicePathwaySection;