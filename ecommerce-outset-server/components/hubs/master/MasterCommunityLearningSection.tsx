
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { MASTER_COMMUNITY_FEATURES } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { UsersGroupIcon } from '../../icons'; // Reusing icon

const MasterCommunityLearningSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Collaborative Learning Community" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<UsersGroupIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Learn faster and deeper by engaging with fellow learners and experts. Our community provides structured opportunities for collaboration, discussion, and mutual support.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MASTER_COMMUNITY_FEATURES.map(feature => (
          <div key={feature.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-purple-700/50">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-400 mb-4 h-20 overflow-y-auto">{feature.description}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="!bg-purple-600 hover:!bg-purple-700"
              onClick={() => {
                trackMasterHubEvent('master_community_feature_cta_clicked', { feature_name: feature.name });
                alert(`Placeholder: Learn more about ${feature.name}`);
              }}
            >
              Explore Feature
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button 
          variant="primary" 
          size="lg"
           className="!bg-purple-500 hover:!bg-purple-600 focus:!ring-purple-400"
          onClick={() => {
            trackMasterHubEvent('join_master_community_clicked');
            window.location.href = "#community"; // Link to main community section or specific learning forum
          }}
        >
          Join the EO Learning Network
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default MasterCommunityLearningSection;