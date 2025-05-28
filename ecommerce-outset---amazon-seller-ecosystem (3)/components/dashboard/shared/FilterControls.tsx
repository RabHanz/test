
import React, { useState } from 'react';
import useAnalyticsStore from '../../../store/analyticsStore';
import type { DateRangeOption } from '../../../types';
import Button from '../../Button';
import { ChevronDownIcon, DownloadIcon } from '../../icons';
import { trackDashboardEvent } from '../../../utils/trackingUtils';

const FilterControls: React.FC = () => {
  const { dateRange, setDateRange, setCustomDateRange } = useAnalyticsStore();
  const [showCustomInputs, setShowCustomInputs] = useState(dateRange === 'custom');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value as DateRangeOption;
    if (newRange === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      setDateRange(newRange);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      // Basic validation: end date should not be before start date
      if (new Date(customEnd) < new Date(customStart)) {
        alert("End date cannot be before start date.");
        return;
      }
      setCustomDateRange(customStart, customEnd);
      trackDashboardEvent('custom_date_apply_clicked', { start: customStart, end: customEnd });
    } else {
      alert("Please select both start and end dates for custom range.");
    }
  };
  
  const handleExport = (format: 'csv' | 'pdf') => {
    trackDashboardEvent('export_report_clicked', { format });
    alert(`Exporting as ${format.toUpperCase()} (feature placeholder).`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
      <div className="relative">
        <select
          value={showCustomInputs ? 'custom' : dateRange}
          onChange={handleDateRangeChange}
          className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full sm:w-auto pl-3 pr-8 py-2 appearance-none"
          aria-label="Select date range"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
        <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      </div>

      {showCustomInputs && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-sm-dark" aria-label="Custom start date" max={new Date().toISOString().split("T")[0]}/>
          <span className="text-gray-400 hidden sm:inline">-</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-sm-dark" aria-label="Custom end date" max={new Date().toISOString().split("T")[0]}/>
          <Button onClick={handleApplyCustomDate} variant="secondary" size="sm" className="w-full sm:w-auto !px-3 !py-1.5">Apply</Button>
        </div>
      )}
      
      <Button onClick={() => handleExport('csv')} variant="secondary" size="sm" className="w-full sm:w-auto !px-3 !py-1.5">
        <DownloadIcon className="w-4 h-4 mr-1.5" /> CSV
      </Button>
      <Button onClick={() => handleExport('pdf')} variant="secondary" size="sm" className="w-full sm:w-auto !px-3 !py-1.5">
        <DownloadIcon className="w-4 h-4 mr-1.5" /> PDF
      </Button>
      <style>{`
        .input-sm-dark {
          background-color: #374151; /* bg-gray-700 */
          border: 1px solid #4B5563; /* border-gray-600 */
          color: #F3F4F6; /* text-gray-200 */
          font-size: 0.875rem; /* text-sm */
          border-radius: 0.375rem; /* rounded-md */
          padding: 0.25rem 0.5rem; /* px-2 py-1 */
        }
        .input-sm-dark:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #F97316; /* border-orange-500 */
          box-shadow: 0 0 0 2px #F9731630; /* ring-orange-500 approx with opacity */
        }
        .input-sm-dark::-webkit-calendar-picker-indicator {
            filter: invert(0.8);
        }
      `}</style>
    </div>
  );
};

export default FilterControls;