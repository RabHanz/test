
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import InteractiveToolStub from '../launch/shared/InteractiveToolStub'; // Reusing generic stub
import { SCALE_INTERACTIVE_TOOLS } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { WrenchScrewdriverIcon } from '../../icons'; // Reusing icon

const ScaleInteractiveToolsSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Advanced Interactive Tools" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<WrenchScrewdriverIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Leverage our suite of data-driven tools to analyze performance, plan effectively, and make informed scaling decisions. 
        (Note: These tools may require integration with your seller data for full functionality).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_INTERACTIVE_TOOLS.map(tool => (
          <InteractiveToolStub
            key={tool.id}
            title={tool.name}
            description={tool.description}
            ctaText={tool.ctaText}
            onCtaClick={() => {
              trackScaleHubEvent('scale_interactive_tool_clicked', { tool_id: tool.id, tool_name: tool.name });
              alert(`Placeholder: Open ${tool.name}. This might require Amazon MWS/SP-API connection.`);
            }}
            className="!bg-gray-800 border !border-blue-600/50 hover:shadow-blue-500/20"
          />
        ))}
      </div>
       <p className="text-xs text-gray-500 mt-8 text-center">
        Integrations with tools like Helium 10, Jungle Scout, and direct Amazon Seller Central data (via SP-API) are planned for enhanced functionality.
      </p>
    </SectionWrapper>
  );
};

export default ScaleInteractiveToolsSection;