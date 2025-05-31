
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { CONNECT_VALUE_DEMO_TOOLS } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { TrendingUpIcon, DownloadIcon } // Reusing for value/ROI
from '../../icons';
import Button from '../../Button';
import ServiceToolStub from './shared/ServiceToolStub';

const ValueDemonstrationFrameworkSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="3. Value Demonstration Framework" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<TrendingUpIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Clearly articulate and prove the tangible results your services deliver. Utilize our methodologies for ROI calculation, success tracking, and compelling client testimonials.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CONNECT_VALUE_DEMO_TOOLS.map(tool => (
          <div key={tool.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-teal-700/30">
            <h3 className="text-lg font-semibold text-teal-300 mb-1">{tool.name}</h3>
            <p className="text-xs text-teal-200 uppercase mb-2">{tool.type}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{tool.description}</p>
            {tool.type === 'Tool' || tool.type === 'System' ? (
              <ServiceToolStub 
                title={`Access ${tool.name}`}
                ctaText="Open Tool/System"
                onCtaClick={() => trackConnectHubEvent('value_demo_tool_accessed', { tool_name: tool.name })}
                accentColorClass="teal"
                className="!bg-teal-700/20 border-teal-600/50"
              />
            ) : (
               <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-teal-600 hover:!bg-teal-700"
                onClick={() => {
                  trackConnectHubEvent('value_demo_framework_downloaded', { framework_name: tool.name });
                  alert(`Placeholder: Download ${tool.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Access {tool.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ValueDemonstrationFrameworkSection;