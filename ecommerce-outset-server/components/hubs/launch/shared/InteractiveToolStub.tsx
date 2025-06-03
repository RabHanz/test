import React from 'react';
import Button from '../../../Button'; // Assuming Button is in components/
import { WrenchScrewdriverIcon } from '../../../icons'; // Assuming icons is in components/

interface InteractiveToolStubProps {
  title: string;
  description?: string;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

const InteractiveToolStub: React.FC<InteractiveToolStubProps> = ({ 
  title, 
  description, 
  ctaText, 
  onCtaClick,
  className = '' 
}) => {
  return (
    <div className={`bg-gray-700/50 p-6 rounded-lg shadow-md border border-gray-700 text-center ${className}`}>
      <WrenchScrewdriverIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
      <h4 className="text-md font-semibold text-white mb-2">{title}</h4>
      {description && <p className="text-xs text-gray-400 mb-4">{description}</p>}
      <Button 
        variant="custom" 
        customColorClass="bg-green-500 hover:bg-green-600"
        size="sm" 
        onClick={onCtaClick}
      >
        {ctaText}
      </Button>
      <p className="text-xs text-gray-600 mt-3">(Interactive Tool Placeholder)</p>
    </div>
  );
};

export default InteractiveToolStub;
