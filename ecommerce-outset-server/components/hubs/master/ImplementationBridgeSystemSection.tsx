
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { MASTER_IMPLEMENTATION_BRIDGES } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { PuzzlePieceIcon } from '../../icons'; // Changed icon
import Button from '../../Button';

const ImplementationBridgeSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="3. Implementation Bridge System" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<PuzzlePieceIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Bridge the gap between theory and action. Our structured exercises, scenario-based modules, and decision-making frameworks help you apply conceptual knowledge to real-world Amazon challenges.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MASTER_IMPLEMENTATION_BRIDGES.map(bridge => (
          <div key={bridge.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700/30">
            <h3 className="text-lg font-semibold text-purple-300 mb-1">{bridge.name}</h3>
            <p className="text-xs text-purple-200 mb-2">{bridge.type} {bridge.durationEstimate && `(${bridge.durationEstimate})`}</p>
            <p className="text-sm text-gray-400 mb-4">{bridge.description}</p>
            <Button 
                variant='custom'
                customColorClass='bg-purple-500 hover:bg-purple-600'
                size='sm' 
                onClick={() => trackMasterHubEvent('implementation_bridge_accessed', {bridge_name: bridge.name})}
            >
                Start Module
            </Button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ImplementationBridgeSystemSection;