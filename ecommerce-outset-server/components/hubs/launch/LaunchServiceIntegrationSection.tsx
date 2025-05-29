
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { LAUNCH_SERVICE_TIERS } from '../../../constants';
import { trackCTAClick, trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { DollarSignIcon } from '../../icons';

const LaunchServiceIntegrationSection: React.FC = () => {
  return (
    <SectionWrapper title="Accelerate Your Launch with EO Services" className="bg-gray-900 py-12 md:py-16" actions={<DollarSignIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Ready to take your launch to the next level? Our specialized service programs offer structured support, expert guidance, and accountability.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LAUNCH_SERVICE_TIERS.map(tier => (
          <div key={tier.id} className="bg-gray-800 p-6 rounded-xl shadow-xl border-2 border-green-500/50 flex flex-col">
            <h3 className="text-2xl font-bold text-green-300 mb-2">{tier.name}</h3>
            <p className="text-3xl font-extrabold text-white mb-3">{tier.price}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{tier.description}</p>
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Potential ROI:</p>
              <p className="text-sm text-green-200">{tier.roiCalc}</p>
            </div>
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">Guarantee:</p>
              <p className="text-sm text-green-200">{tier.guarantee}</p>
            </div>
            <Button
              variant="custom"
              customColorClass="bg-green-500 hover:bg-green-600"
              size="md"
              className="w-full mt-auto"
              onClick={() => {
                trackCTAClick(`Explore ${tier.name}`);
                trackLaunchHubEvent('service_tier_explore_clicked', { tier_name: tier.name });
                // Link to service page or sales modal
              }}
            >
              Explore {tier.name}
            </Button>
            {/* Placeholder for payment plan info */}
            {/* <p className="text-xs text-gray-500 text-center mt-3">Payment plans available</p> */}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default LaunchServiceIntegrationSection;
