
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { CONNECT_EXPERTISE_FRAMEWORKS } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { MegaphoneIcon, DownloadIcon } from '../../icons';
import Button from '../../Button';
import ServiceToolStub from './shared/ServiceToolStub';

const ExpertiseShowcaseSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="1. Expertise Showcase System" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<MegaphoneIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Effectively communicate your unique value and establish yourself as an authority. Our system provides frameworks, templates, and tools to build credibility and attract ideal clients.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CONNECT_EXPERTISE_FRAMEWORKS.map(fw => (
          <div key={fw.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-teal-700/30">
            <h3 className="text-lg font-semibold text-teal-300 mb-1">{fw.name}</h3>
            <p className="text-xs text-teal-200 uppercase mb-2">{fw.type}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{fw.description}</p>
            {fw.type === 'Tool' || fw.type === 'System' ? (
              <ServiceToolStub 
                title={`Access ${fw.name}`}
                ctaText="Open Tool/System"
                onCtaClick={() => trackConnectHubEvent('expertise_tool_accessed', { tool_name: fw.name })}
                accentColorClass="teal"
                className="!bg-teal-700/20 border-teal-600/50"
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-teal-600 hover:!bg-teal-700"
                onClick={() => {
                  trackConnectHubEvent('expertise_framework_downloaded', { framework_name: fw.name });
                  alert(`Placeholder: Download ${fw.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Access {fw.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ExpertiseShowcaseSystemSection;