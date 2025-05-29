
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { SCALE_SCALING_INFRASTRUCTURE } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { DatabaseIcon, DownloadIcon } from '../../icons';
import InteractiveToolStub from '../launch/shared/InteractiveToolStub';

const ScalingInfrastructureSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="4. Robust Scaling Infrastructure" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<DatabaseIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Build the backbone for sustainable 7-figure growth. Optimize your financial systems, inventory management, supply chain, technology stack, and team structure.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_SCALING_INFRASTRUCTURE.map(infra => (
          <div key={infra.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{infra.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{infra.description}</p>
            {infra.type === 'Planner' || infra.type === 'Dashboard' || infra.type === 'System' ? (
              <InteractiveToolStub 
                title={`Access ${infra.name}`}
                ctaText="Open Tool/System"
                onCtaClick={() => trackScaleHubEvent(`${infra.id}_infra_tool_accessed`)}
                className="!bg-blue-700/30 border-blue-600"
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-blue-600 hover:!bg-blue-700"
                onClick={() => {
                  trackScaleHubEvent(`${infra.id}_download_clicked`);
                   alert(`Placeholder: Download ${infra.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Download {infra.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ScalingInfrastructureSection;