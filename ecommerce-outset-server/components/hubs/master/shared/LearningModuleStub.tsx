
import React from 'react';
import Button from '../../../Button'; 
import { BookOpenIcon } from '../../../icons'; // Example icon

interface LearningModuleStubProps {
  title: string;
  description?: string;
  ctaText: string;
  onCtaClick: () => void;
  accentColorClass?: 'purple' | 'blue' | 'green'; // Example, can be expanded
  className?: string;
}

const LearningModuleStub: React.FC<LearningModuleStubProps> = ({ 
  title, 
  description, 
  ctaText, 
  onCtaClick,
  accentColorClass = 'purple',
  className = '' 
}) => {
  const colors = {
    purple: {
      text: 'text-purple-300',
      border: 'border-purple-600/50',
      hoverShadow: 'hover:shadow-purple-500/20',
      buttonBg: 'bg-purple-500 hover:bg-purple-600',
      iconText: 'text-purple-400'
    },
    // Add other colors if needed
  };
  const selectedColor = colors[accentColorClass] || colors.purple;

  return (
    <div className={`bg-gray-700/50 p-6 rounded-lg shadow-md border ${selectedColor.border} text-center ${className} ${selectedColor.hoverShadow} transition-shadow duration-300`}>
      <BookOpenIcon className={`w-10 h-10 ${selectedColor.iconText} mx-auto mb-3`} />
      <h4 className={`text-md font-semibold text-white mb-2`}>{title}</h4>
      {description && <p className="text-xs text-gray-400 mb-4 h-16 overflow-y-auto">{description}</p>}
      <Button 
        variant="custom" 
        customColorClass={selectedColor.buttonBg}
        size="sm" 
        onClick={onCtaClick}
      >
        {ctaText}
      </Button>
      <p className="text-xs text-gray-600 mt-3">(Interactive Learning Module Placeholder)</p>
    </div>
  );
};

export default LearningModuleStub;
