
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { CONNECT_PREMIUM_POSITIONING } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { SparklesIcon, DownloadIcon } // Reusing Sparkles for 'premium'
from '../../icons';
import Button from '../../Button';
import ServiceToolStub from './shared/ServiceToolStub';

const PremiumPositioningSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="4. Premium Positioning System" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<SparklesIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Elevate your service business above price competition. Our system helps you analyze market positioning, optimize pricing, develop attractive service tiers, and implement value-based strategies.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CONNECT_PREMIUM_POSITIONING.map(strat => (
          <div key={strat.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col border border-teal-700/30">
            <h3 className="text-lg font-semibold text-teal-300 mb-1">{strat.name}</h3>
            <p className="text-xs text-teal-200 uppercase mb-2">{strat.type}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{strat.description}</p>
             {strat.type === 'Tool' ? (
              <ServiceToolStub 
                title={`Access ${strat.name}`}
                ctaText="Open Tool"
                onCtaClick={() => trackConnectHubEvent('positioning_tool_accessed', { tool_name: strat.name })}
                accentColorClass="teal"
                className="!bg-teal-700/20 border-teal-600/50"
              />
            ) : (
               <Button 
                variant="secondary" 
                size="sm" 
                className="mt-auto w-full !bg-teal-600 hover:!bg-teal-700"
                onClick={() => {
                  trackConnectHubEvent('positioning_framework_downloaded', { framework_name: strat.name });
                  alert(`Placeholder: Download ${strat.name}`);
                }}
              >
                <DownloadIcon className="w-4 h-4 mr-2"/> Access {strat.type}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default PremiumPositioningSystemSection;