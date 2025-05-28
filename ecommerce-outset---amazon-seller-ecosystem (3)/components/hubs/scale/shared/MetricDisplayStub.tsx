import React from 'react';
import { ActivityIcon } from '../../../icons'; // Or a more specific icon

interface MetricDisplayStubProps {
  title: string;
  value: string;
  status?: string;
  statusColorClass?: string; // e.g. 'text-green-400', 'text-yellow-400', 'text-red-400'
  description?: string;
  className?: string;
}

const MetricDisplayStub: React.FC<MetricDisplayStubProps> = ({
  title,
  value,
  status,
  statusColorClass = 'text-blue-300',
  description,
  className = ''
}) => {
  return (
    <div className={`bg-blue-800/30 p-4 md:p-6 rounded-lg shadow-md border border-blue-600/50 text-center ${className}`}>
      <ActivityIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-3xl md:text-4xl font-bold text-blue-200 mb-1">{value}</p>
      {status && <p className={`text-xs font-medium ${statusColorClass}`}>{status}</p>}
      {description && <p className="text-xs text-blue-400 mt-2">{description}</p>}
      <p className="text-xs text-blue-600 mt-3">(Metric Indicator Placeholder)</p>
    </div>
  );
};

export default MetricDisplayStub;