
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { SCALE_OPERATIONAL_EXCELLENCE_FRAMEWORKS } from '../../../constants';
import { trackScaleHubEvent } from '../../../utils/trackingUtils';
import { CogIcon, DownloadIcon } from '../../icons';
import InteractiveToolStub from '../launch/shared/InteractiveToolStub';

const OperationalExcellenceFrameworksSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="2. Operational Excellence Frameworks" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<CogIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Build a resilient and efficient business engine. Implement our proven frameworks for process optimization, team delegation, SOPs, and automation to reclaim your time and scale effectively.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SCALE_OPERATIONAL_EXCELLENCE_FRAMEWORKS.map(framework => (
          <div key={framework.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{framework.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{framework.description}</p>
             {framework.type === 'Tool' || framework.type === 'Framework' ? (
              <InteractiveToolStub 
                title={`Access ${framework.name}`}
                ctaText="Open Tool/Framework"
                onCtaClick={() => trackScaleHubEvent(`${framework.id}_framework_accessed`)} 
                className="!bg-blue-700/30 border-blue-600"
              />
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-blue-600 hover:!bg-blue-700"
                onClick={() => {
                  trackScaleHubEvent(`${framework.id}_download_clicked`);
                   alert(`Placeholder: Download ${framework.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Download {framework.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default OperationalExcellenceFrameworksSection;