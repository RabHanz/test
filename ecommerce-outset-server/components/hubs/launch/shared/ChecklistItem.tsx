import React from 'react';
import { CheckCircleIcon } from '../../../icons'; // Assuming general CheckCircleIcon for completion

interface ChecklistItemProps {
  label: string;
  description?: string;
  isCompleted?: boolean; // To be managed by store later
  onToggle?: () => void;  // To be managed by store later
  className?: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  label, 
  description, 
  isCompleted = false, 
  onToggle,
  className = '' 
}) => {
  return (
    <div className={`flex items-start p-3 bg-gray-800 rounded-md ${className}`}>
      {/* Stubbed toggle interaction */}
      <button 
        onClick={onToggle} 
        className={`mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-green-400'} transition-colors focus:outline-none`}
        aria-label={`Mark ${label} as ${isCompleted ? 'incomplete' : 'complete'}`}
      >
        {isCompleted && <CheckCircleIcon className="w-full h-full text-white p-0.5" />}
      </button>
      <div>
        <h5 className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-green-200'}`}>{label}</h5>
        {description && <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>{description}</p>}
      </div>
    </div>
  );
};

export default ChecklistItem;
