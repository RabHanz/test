
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { LAUNCH_COMMUNITY_FEATURES } from '../../../constants';
import { trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { UsersGroupIcon } from '../../icons';

const LaunchCommunityFeaturesSection: React.FC = () => {
  return (
    <SectionWrapper title="Join the EO Launch Community" className="bg-gray-850 py-12 md:py-16" actions={<UsersGroupIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        You're not alone on this journey! Connect with fellow launchers, get expert advice, and stay motivated with our supportive community features.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {LAUNCH_COMMUNITY_FEATURES.map(feature => (
          <div key={feature.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold text-green-300 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{feature.description}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                trackLaunchHubEvent('community_feature_cta_clicked', { feature_name: feature.name });
                alert(`Placeholder: Learn more about ${feature.name}`);
              }}
            >
              Learn More
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            trackLaunchHubEvent('join_community_clicked_launch_hub');
            window.location.href = "#community"; // Link to main community section or specific FB group
          }}
        >
          Access the Full EO Community
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default LaunchCommunityFeaturesSection;
