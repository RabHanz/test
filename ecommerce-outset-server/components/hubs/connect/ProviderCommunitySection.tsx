
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { CONNECT_PROVIDER_COMMUNITY } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { UsersGroupIcon } // Reusing icon
from '../../icons';

const ProviderCommunitySection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Thriving Provider Community" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<UsersGroupIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Join a network of successful Amazon service providers. Collaborate, share knowledge, access exclusive resources, and elevate your business alongside your peers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONNECT_PROVIDER_COMMUNITY.map(feature => (
          <div key={feature.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-teal-700/50 h-full flex flex-col">
            <UsersGroupIcon className="w-8 h-8 text-teal-400 mx-auto mb-3"/>
            <h3 className="text-lg font-semibold text-teal-300 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow h-20 overflow-y-auto">{feature.description}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="!bg-teal-600 hover:!bg-teal-700 mt-auto"
              onClick={() => {
                trackConnectHubEvent('provider_community_feature_clicked', { feature_name: feature.name });
                alert(`Placeholder: Learn more about ${feature.name}`);
              }}
            >
              Engage Now
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button 
          variant="primary" 
          size="lg"
           className="!bg-teal-500 hover:!bg-teal-600 focus:!ring-teal-400"
          onClick={() => {
            trackConnectHubEvent('join_provider_community_clicked');
            window.location.href = "#community"; // Link to main community section or specific provider forum
          }}
        >
          Join the EO Provider Network
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default ProviderCommunitySection;