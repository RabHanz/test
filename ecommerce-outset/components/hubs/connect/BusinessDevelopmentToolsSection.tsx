
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import ServiceToolStub from './shared/ServiceToolStub';
import { CONNECT_BIZ_DEV_TOOLS } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { 
    WrenchScrewdriverIcon, 
    CalculatorIcon, 
    PuzzlePieceIcon, 
    CogIcon, 
    BarChartIcon, 
    ClipboardListIcon 
} from '../../icons'; // Imported all necessary icons
import type { BusinessDevelopmentTool } from '../../../types';

const BusinessDevelopmentToolsSection: React.FC = () => {
    const getIconForToolType = (toolType: BusinessDevelopmentTool['toolType']) => {
        switch (toolType) {
          case 'Calculator': return CalculatorIcon;
          case 'Framework': return PuzzlePieceIcon;
          case 'System': return CogIcon;
          case 'Dashboard': return BarChartIcon;
          case 'Planner': return ClipboardListIcon;
          default: return WrenchScrewdriverIcon;
        }
      };

  return (
    <SectionWrapper 
      title="Business Development Tools" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<WrenchScrewdriverIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Equip your service business with tools for growth. From client acquisition calculators to performance dashboards, these resources are designed to enhance your efficiency and profitability.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CONNECT_BIZ_DEV_TOOLS.map(tool => (
          <ServiceToolStub
            key={tool.id}
            title={tool.name}
            description={`${tool.toolType}: ${tool.description}`}
            ctaText="Access Tool"
            onCtaClick={() => {
              trackConnectHubEvent('biz_dev_tool_clicked', { tool_id: tool.id, tool_name: tool.name });
              alert(`Placeholder: Open ${tool.name}.`);
            }}
            icon={getIconForToolType(tool.toolType)}
            accentColorClass="teal"
            className="!bg-gray-800 border !border-teal-600/50 hover:shadow-teal-500/20"
          />
        ))}
      </div>
       <p className="text-xs text-gray-500 mt-8 text-center">
        CRM integration, project management tool connections, and advanced automation workflows are part of our long-term vision for EO Connect members.
      </p>
    </SectionWrapper>
  );
};

export default BusinessDevelopmentToolsSection;
