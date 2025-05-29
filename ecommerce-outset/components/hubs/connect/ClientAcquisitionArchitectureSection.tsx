
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { CONNECT_CLIENT_ACQUISITION_METHODS } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { UsersIcon, DownloadIcon } from '../../icons'; // Reusing UsersIcon for clients
import Button from '../../Button';
import ServiceToolStub from './shared/ServiceToolStub';

const ClientAcquisitionArchitectureSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="2. Client Acquisition Architecture" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<UsersIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Systematically attract and convert your ideal Amazon seller clients. From profiling to outreach and closing, our architecture helps you build a predictable client pipeline.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CONNECT_CLIENT_ACQUISITION_METHODS.map(method => (
          <div key={method.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-teal-700/30">
            <h3 className="text-lg font-semibold text-teal-300 mb-1">{method.name}</h3>
            <p className="text-xs text-teal-200 uppercase mb-2">{method.type}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{method.description}</p>
            {method.type === 'Tool' || method.type === 'System' ? (
              <ServiceToolStub 
                title={`Access ${method.name}`}
                ctaText="Open Tool/System"
                onCtaClick={() => trackConnectHubEvent('acquisition_tool_accessed', { tool_name: method.name })}
                accentColorClass="teal"
                className="!bg-teal-700/20 border-teal-600/50"
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-teal-600 hover:!bg-teal-700"
                onClick={() => {
                  trackConnectHubEvent('acquisition_framework_downloaded', { framework_name: method.name });
                  alert(`Placeholder: Download ${method.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Access {method.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ClientAcquisitionArchitectureSection;