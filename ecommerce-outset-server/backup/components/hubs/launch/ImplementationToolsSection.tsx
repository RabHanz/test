
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { LAUNCH_IMPLEMENTATION_TOOLS } from '../../../constants';
import { trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { WrenchScrewdriverIcon, DownloadIcon } from '../../icons';
import InteractiveToolStub from './shared/InteractiveToolStub';

const ImplementationToolsSection: React.FC = () => {
  return (
    <SectionWrapper title="4. Essential Implementation Tools" className="bg-gray-900 py-12 md:py-16" actions={<WrenchScrewdriverIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Access our suite of templates, guides, and (soon) automation tools designed to streamline your launch process and ensure quality from day one.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {LAUNCH_IMPLEMENTATION_TOOLS.map(tool => (
          <div key={tool.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-green-300 mb-2">{tool.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{tool.description}</p>
            {tool.type === "Tool Preview" ? (
                 <InteractiveToolStub title={tool.name} ctaText="Learn More (Soon)" onCtaClick={() => trackLaunchHubEvent(`${tool.id}_preview_clicked`)} />
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
                    <DownloadIcon className="w-4 h-4 mr-2"/> Download {tool.type.replace('Downloadable ', '').replace('Guide + ', '')}
                </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ImplementationToolsSection;
