
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import LearningModuleStub from './shared/LearningModuleStub';
import { MASTER_ECOSYSTEM_COMPONENTS } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { NetworkIcon } from '../../icons';

const AmazonEcosystemModelSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="1. The Amazon Ecosystem Model" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<NetworkIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Visualize the interconnectedness of the Amazon universe. Understand how each component influences others and identify strategic leverage points for your business.
      </p>
      
      <LearningModuleStub
        title="Interactive Ecosystem Framework"
        description="Click on components to explore detailed explanations, relationships, and impact analysis tools. Develop your systems thinking."
        ctaText="Explore Model"
        onCtaClick={() => trackMasterHubEvent('ecosystem_model_explored')}
        accentColorClass="purple"
      />

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Key Ecosystem Components:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MASTER_ECOSYSTEM_COMPONENTS.map(component => (
            <div key={component.id} className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-purple-500/20 transition-shadow">
              <h4 className="font-semibold text-purple-300 mb-1">{component.name}</h4>
              <p className="text-xs text-gray-400">{component.description}</p>
              {component.detailsLink && (
                 <a href={component.detailsLink} onClick={() => trackMasterHubEvent('ecosystem_component_details_clicked', { component: component.name })} className="text-xs text-orange-400 hover:underline mt-2 inline-block">Learn More &raquo;</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AmazonEcosystemModelSection;