
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper'; // Reusing dashboard's SectionWrapper
import InteractiveToolStub from './shared/InteractiveToolStub';
import Button from '../../Button';
import { PRODUCT_SELECTION_TOOLS } from '../../../constants';
import { trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { TargetIcon, DownloadIcon } from '../../icons';

const ProductSelectionFrameworkSection: React.FC = () => {
  return (
    <SectionWrapper title="1. Product Selection Framework" className="bg-gray-850 py-12 md:py-16" actions={<TargetIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Finding the right product is the most critical first step. Our framework helps you identify high-potential products, validate your ideas, and minimize risk.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {PRODUCT_SELECTION_TOOLS.map(tool => (
          <div key={tool.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-green-300 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{tool.description}</p>
            {tool.type === 'Interactive Tool' ? (
              <InteractiveToolStub title={tool.name} ctaText="Open Calculator" onCtaClick={() => trackLaunchHubEvent(`${tool.id}_tool_opened`)} />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="mt-auto w-full"
                onClick={() => {
                  trackLaunchHubEvent(`${tool.id}_download_clicked`);
                  alert(`Placeholder: Download ${tool.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Download {tool.type.replace('Downloadable ', '')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ProductSelectionFrameworkSection;
