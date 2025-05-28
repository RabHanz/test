import React from 'react';
import { BarChartIcon } from '../../icons'; 

interface ChartPlaceholderProps {
  title: string;
  height?: string; 
  className?: string;
  message?: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, height = 'h-64', className = '', message }) => {
  return (
    <div className={`bg-gray-700/50 p-4 rounded-lg shadow flex flex-col items-center justify-center ${height} ${className} border border-gray-700`}>
      <BarChartIcon className="w-12 h-12 text-gray-500 mb-3" />
      <h4 className="text-sm font-medium text-gray-400 mb-1 text-center">{title}</h4>
      <p className="text-xs text-gray-500 text-center">{message || 'Chart data will be displayed here.'}</p>
      <p className="text-xs text-gray-600 mt-2">(Recharts integration pending)</p>
    </div>
  );
};

export default ChartPlaceholder;
