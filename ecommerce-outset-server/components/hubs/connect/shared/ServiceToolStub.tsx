
import React from 'react';
import Button from '../../../Button'; 
import { WrenchScrewdriverIcon } from '../../../icons'; // Default icon, can be overridden by prop

interface ServiceToolStubProps {
  title: string;
  description?: string;
  value?: string; 
  ctaText: string;
  onCtaClick: () => void;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  accentColorClass?: 'teal' | 'blue' | 'green' | 'purple' | 'yellow';
  className?: string;
}

const ServiceToolStub: React.FC<ServiceToolStubProps> = ({ 
  title, 
  description, 
  value,
  ctaText, 
  onCtaClick,
  icon,
  accentColorClass = 'teal',
  className = '' 
}) => {
  const colors = {
    teal: {
      text: 'text-teal-300',
      border: 'border-teal-600/50',
      hoverShadow: 'hover:shadow-teal-500/20',
      buttonBg: 'bg-teal-500 hover:bg-teal-600',
      iconText: 'text-teal-400',
      valueText: 'text-teal-200'
    },
    // Add other colors if needed
  };
  const selectedColor = colors[accentColorClass] || colors.teal;
  const IconComponent = icon || WrenchScrewdriverIcon;

  return (
    <div className={`bg-gray-700/30 p-6 rounded-lg shadow-md border ${selectedColor.border} text-center ${className} ${selectedColor.hoverShadow} transition-shadow duration-300 flex flex-col h-full`}>
      <IconComponent className={`w-10 h-10 ${selectedColor.iconText} mx-auto mb-3`} />
      <h4 className={`text-md font-semibold text-white mb-1`}>{title}</h4>
      {value && <p className={`text-2xl font-bold ${selectedColor.valueText} mb-2`}>{value}</p>}
      {description && <p className={`text-xs ${value ? 'text-gray-400' : 'text-gray-300'} mb-4 flex-grow`}>{description}</p>}
      
      <Button 
        variant="custom" 
        customColorClass={selectedColor.buttonBg}
        size="sm" 
        onClick={onCtaClick}
        className="mt-auto" // Push button to bottom
      >
        {ctaText}
      </Button>
      <p className="text-xs text-gray-600 mt-3">(Interactive Tool Placeholder)</p>
    </div>
  );
};

export default ServiceToolStub;