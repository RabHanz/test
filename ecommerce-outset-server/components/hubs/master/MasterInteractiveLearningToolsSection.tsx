
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import LearningModuleStub from './shared/LearningModuleStub'; // Reusing generic stub
import { MASTER_INTERACTIVE_TOOLS } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { WrenchScrewdriverIcon } from '../../icons'; 

const MasterInteractiveLearningToolsSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Interactive Learning Tools" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<WrenchScrewdriverIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Engage with dynamic tools designed to deepen your understanding and test your knowledge in practical ways. (Note: Some tools are in active development).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {MASTER_INTERACTIVE_TOOLS.map(tool => (
          <LearningModuleStub
            key={tool.id}
            title={tool.name}
            description={`${tool.toolType}: ${tool.description}`}
            ctaText="Launch Tool"
            onCtaClick={() => {
              trackMasterHubEvent('master_interactive_tool_clicked', { tool_id: tool.id, tool_name: tool.name });
              alert(`Placeholder: Open ${tool.name}.`);
            }}
            accentColorClass="purple"
            className="!bg-gray-800 border !border-purple-600/50 hover:shadow-purple-500/20"
          />
        ))}
      </div>
       <p className="text-xs text-gray-500 mt-8 text-center">
        Our tool suite is constantly expanding. Advanced features like adaptive learning and spaced repetition systems are on our roadmap.
      </p>
    </SectionWrapper>
  );
};

export default MasterInteractiveLearningToolsSection;