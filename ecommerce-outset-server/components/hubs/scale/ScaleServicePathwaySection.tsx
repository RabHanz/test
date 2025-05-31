
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { SCALE_SERVICE_PATHWAY } from '../../../constants';
import { trackCTAClick, trackScaleHubEvent } from '../../../utils/trackingUtils';
import { DollarSignIcon, CheckCircleIcon } from '../../icons';

const ScaleServicePathwaySection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Your Pathway to 7-Figure+ Scaling" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<DollarSignIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Choose the right level of support and expertise to accelerate your growth. Our programs are designed for measurable results and significant ROI.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {SCALE_SERVICE_PATHWAY.map(tier => (
          <div key={tier.id} className={`bg-gray-800 p-6 rounded-xl shadow-xl border-2 ${tier.id === 'sap' ? 'border-blue-500 scale-105' : 'border-blue-700'} flex flex-col`}>
            {tier.id === 'sap' && <div className="text-center mb-3"><span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">POPULAR</span></div>}
            <h3 className="text-2xl font-bold text-blue-300 mb-2 text-center">{tier.name}</h3>
            <p className="text-3xl font-extrabold text-white mb-1 text-center">{tier.price}</p>
            <p className="text-xs text-gray-400 mb-4 text-center">({tier.timeline})</p>
            <p className="text-sm text-gray-400 mb-5 text-center flex-grow">{tier.description}</p>
            
            <h5 className="text-sm font-semibold text-white mb-2">Key Features:</h5>
            <ul className="space-y-1.5 text-xs text-gray-300 mb-5 flex-grow">
              {tier.features.slice(0,3).map(feature => (
                <li key={feature} className="flex items-start">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 mr-2 mt-0.5 flex-shrink-0"/> {feature}
                </li>
              ))}
               {tier.features.length > 3 && <li>+ {tier.features.length-3} more...</li>}
            </ul>

            {tier.guarantee && (
              <div className="mb-5">
                <p className="text-xs text-gray-500 mb-0.5">Guarantee:</p>
                <p className="text-sm text-blue-200 font-semibold">{tier.guarantee}</p>
              </div>
            )}
            <Button 
              variant="custom"
              customColorClass={tier.id === 'sap' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'}
              size="md" 
              className="w-full mt-auto"
              onClick={() => {
                trackCTAClick(`Explore ${tier.name} (Scale)`);
                trackScaleHubEvent('scale_service_explore_clicked', { tier_name: tier.name });
                // Link to service page or sales modal
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

export default ScaleServicePathwaySection;