
import React from 'react';
import { CheckCircleIcon, MinusCircleIcon } from '../../icons';

export interface ChecklistItemClientProps {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  onToggle: () => void; // Simplified: The function passed IS the action for THIS item.
  subSteps?: ChecklistItemClientProps[];
  estimatedTime?: string;
  relatedAction?: { text: string, link?: string, onClick?: () => void };
  accentColorClass?: string; 
  depth?: number;
}

const ChecklistItemClient: React.FC<ChecklistItemClientProps> = ({ 
  id,
  title, 
  description, 
  isCompleted, 
  onToggle, // This is now () => void; already specific to this item.
  subSteps,
  estimatedTime,
  relatedAction,
  accentColorClass = 'orange-500',
  depth = 0
}) => {

  const handleToggle = () => {
    onToggle(); // Call the specific toggle action for this item.
  };

  const allSubstepsCompleted = subSteps ? subSteps.every(s => s.isCompleted) : true;
  const effectiveCompleted = isCompleted && allSubstepsCompleted;

  const borderAccent = `border-${accentColorClass}`;
  const textAccent = `text-${accentColorClass.replace('-500', '-400')}`;


  return (
    <div className={`py-3 ${depth > 0 ? `ml-${depth * 4} pl-3 border-l border-gray-700` : ''}`}>
      <div className="flex items-start group"> {/* Added group for hover effect on icon */}
        <button
          onClick={handleToggle}
          className={`mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 focus:outline-none flex items-center justify-center
            ${effectiveCompleted 
              ? `${borderAccent} bg-${accentColorClass}` 
              : `border-gray-600 hover:${borderAccent}`
            }`}
          aria-label={`Mark ${title} as ${effectiveCompleted ? 'incomplete' : 'complete'}`}
        >
          {effectiveCompleted && <CheckCircleIcon className="w-3 h-3 text-white" />}
          {!effectiveCompleted && <MinusCircleIcon className="w-3 h-3 text-gray-500 group-hover:text-white" />}
        </button>
        <div className="flex-grow">
          <h5 className={`font-medium ${effectiveCompleted ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
            {title}
            {estimatedTime && <span className="text-xs text-gray-500 ml-2">({estimatedTime})</span>}
          </h5>
          {description && <p className={`text-xs ${effectiveCompleted ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>{description}</p>}
          {relatedAction && !effectiveCompleted && (
            <button 
                onClick={relatedAction.onClick ? relatedAction.onClick : () => { if(relatedAction.link) window.location.href = relatedAction.link; }}
                className={`mt-1 text-xs ${textAccent} hover:underline`}
            >
                {relatedAction.text} &rarr;
            </button>
          )}
        </div>
      </div>
      {subSteps && subSteps.length > 0 && (
        <div className="mt-2">
          {subSteps.map(subStep => (
            <ChecklistItemClient 
              key={subStep.id}
              {...subStep} // Pass all props; subStep.onToggle is already correctly bound by OnboardingChecklist
              accentColorClass={accentColorClass} // Ensure accentColorClass is passed down
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistItemClient;
