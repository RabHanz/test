
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { SCALE_MASTERMIND_FEATURES } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { LightBulbIcon } from '../../icons'; // Using LightBulb for 'insights' or 'mastermind'

const ScaleMastermindIntegrationSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Exclusive Scaling Masterminds" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<LightBulbIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Connect with elite, like-minded sellers in our curated masterminds. Share advanced strategies, solve complex challenges, and accelerate your journey to 7-figures and beyond.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_MASTERMIND_FEATURES.slice(0,3).map(feature => ( // Show first 3 prominent features
          <div key={feature.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-blue-700">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
          </div>
        ))}
      </div>
       <div className="text-center mt-12">
        <Button 
          variant="primary" 
          size="lg"
          className="!bg-blue-500 hover:!bg-blue-600 focus:!ring-blue-400"
          onClick={() => {
            trackScaleHubEvent('apply_for_mastermind_clicked');
            alert("Placeholder: Redirect to Mastermind Application Page or Info Section");
          }}
        >
          Apply for Mastermind Access
        </Button>
        <p className="text-xs text-gray-500 mt-3">Mastermind access is typically included with advanced service tiers or by application.</p>
      </div>
    </SectionWrapper>
  );
};

export default ScaleMastermindIntegrationSection;