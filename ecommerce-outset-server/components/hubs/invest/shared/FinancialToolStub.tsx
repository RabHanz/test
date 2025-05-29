
import React from 'react';
import Button from '../../../Button'; 
import { CalculatorIcon } from '../../../icons'; // Default icon

interface FinancialToolStubProps {
  title: string;
  description?: string;
  value?: string; // For displaying a key metric within the stub
  ctaText?: string;
  onCtaClick?: () => void;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  accentColorClass?: 'yellow' | 'blue' | 'green' | 'purple';
  className?: string;
}

const FinancialToolStub: React.FC<FinancialToolStubProps> = ({ 
  title, 
  description, 
  value,
  ctaText, 
  onCtaClick,
  icon,
  accentColorClass = 'yellow',
  className = '' 
}) => {
  const colors = {
    yellow: {
      text: 'text-yellow-300',
      border: 'border-yellow-600/50',
      hoverShadow: 'hover:shadow-yellow-500/20',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
      iconText: 'text-yellow-400',
      valueText: 'text-yellow-200'
    },
    // Add other colors if needed for reuse
  };
  const selectedColor = colors[accentColorClass] || colors.yellow;
  const IconComponent = icon || CalculatorIcon;

  return (
    <div className={`bg-gray-700/50 p-6 rounded-lg shadow-md border ${selectedColor.border} text-center ${className} ${selectedColor.hoverShadow} transition-shadow duration-300 flex flex-col`}>
      <IconComponent className={`w-10 h-10 ${selectedColor.iconText} mx-auto mb-3`} />
      <h4 className={`text-md font-semibold text-white mb-1`}>{title}</h4>
      {value && <p className={`text-2xl font-bold ${selectedColor.valueText} mb-2`}>{value}</p>}
      {description && <p className={`text-xs ${value ? 'text-gray-400' : 'text-gray-300'} mb-4 flex-grow`}>{description}</p>}
      {ctaText && onCtaClick && (
        <Button 
          variant="custom" 
          customColorClass={selectedColor.buttonBg}
          size="sm" 
          onClick={onCtaClick}
          className="mt-auto"
        >
          {ctaText}
        </Button>
      )}
      {!ctaText && <p className="text-xs text-gray-600 mt-3 flex-grow flex items-end justify-center">(Financial Tool Placeholder)</p>}
    </div>
  );
};

export default FinancialToolStub;
