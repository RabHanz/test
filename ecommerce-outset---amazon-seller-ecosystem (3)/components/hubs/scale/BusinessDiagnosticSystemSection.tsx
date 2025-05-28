
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper'; // Reusing dashboard's SectionWrapper
import InteractiveToolStub from '../launch/shared/InteractiveToolStub'; // Reusing from launch for now
import Button from '../../Button';
import { SCALE_BUSINESS_DIAGNOSTIC_TOOLS } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { BriefcaseIcon, DownloadIcon } from '../../icons';

const BusinessDiagnosticSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="1. Business Diagnostic System" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<BriefcaseIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Understand the true health of your Amazon business. Our comprehensive diagnostic system pinpoints bottlenecks, identifies high-ROI opportunities, and sets the stage for strategic scaling.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_BUSINESS_DIAGNOSTIC_TOOLS.map(tool => (
          <div key={tool.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{tool.description}</p>
            {tool.type === 'Assessment' || tool.type === 'Calculator' || tool.type === 'Analysis Tool' ? (
              <InteractiveToolStub 
                title={tool.name} 
                ctaText={`Access ${tool.type}`}
                onCtaClick={() => trackScaleHubEvent(`${tool.id}_tool_opened`)} 
                className="!bg-blue-700/30 border-blue-600" // Example for slight theme change
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-blue-600 hover:!bg-blue-700"
                onClick={() => {
                  trackScaleHubEvent(`${tool.id}_download_clicked`);
                  alert(`Placeholder: Download ${tool.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Download {tool.type}
              </Button>
            )}
          </div>
        ))}
      </div>
       <div className="text-center mt-10">
        <Button 
            variant="primary" 
            size="lg" 
            onClick={() => {
                trackScaleHubEvent('start_full_diagnostic_clicked');
                window.location.href = "#scale-diagnostic-tool"; // Link to actual diagnostic tool/page
            }}
            className="!bg-blue-500 hover:!bg-blue-600 focus:!ring-blue-400"
        >
            Start Your 15-Point Business Diagnostic
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default BusinessDiagnosticSystemSection;