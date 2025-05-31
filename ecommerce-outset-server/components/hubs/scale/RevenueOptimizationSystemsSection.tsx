
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { SCALE_REVENUE_OPTIMIZATION_SYSTEMS } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { TrendingUpIcon, DownloadIcon } from '../../icons';
import InteractiveToolStub from '../launch/shared/InteractiveToolStub';

const RevenueOptimizationSystemsSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="3. Revenue Optimization Systems" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<TrendingUpIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Maximize your top-line growth and profitability. Our systems help you enhance PPC performance, boost listing conversions, optimize pricing, and strategically expand your market reach.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_REVENUE_OPTIMIZATION_SYSTEMS.map(system => (
          <div key={system.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{system.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{system.description}</p>
            {system.type === 'Tool' || system.type === 'System' || system.type === 'Matrix' ? (
              <InteractiveToolStub 
                title={`Access ${system.name}`}
                ctaText="Open System/Tool"
                onCtaClick={() => trackScaleHubEvent(`${system.id}_system_accessed`)}
                className="!bg-blue-700/30 border-blue-600"
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-blue-600 hover:!bg-blue-700"
                onClick={() => {
                  trackScaleHubEvent(`${system.id}_download_clicked`);
                  alert(`Placeholder: Download ${system.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Download {system.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default RevenueOptimizationSystemsSection;