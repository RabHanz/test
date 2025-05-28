import React from 'react';
import { Card, Title, Text, Select, SelectItem } from '@tremor/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AnalyticsFilters as Filters } from '../../utils/analytics/analyticsService';

interface AnalyticsFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onFilterChange({
      startDate: start?.toISOString().split('T')[0],
      endDate: end?.toISOString().split('T')[0],
    });
  };

  const handleSegmentChange = (value: string) => {
    onFilterChange({ segment: value });
  };

  const handleChannelChange = (value: string) => {
    onFilterChange({ channel: value });
  };

  return (
    <Card>
      <Title>Analytics Filters</Title>
      <div className="mt-4 space-y-4">
        <div>
          <Text>Date Range</Text>
          <DatePicker
            selected={filters.startDate ? new Date(filters.startDate) : null}
            onChange={handleDateChange}
            startDate={filters.startDate ? new Date(filters.startDate) : null}
            endDate={filters.endDate ? new Date(filters.endDate) : null}
            selectsRange
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <div>
          <Text>Segment</Text>
          <Select
            value={filters.segment || ''}
            onValueChange={handleSegmentChange}
            className="mt-1"
          >
            <SelectItem value="">All Segments</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="mid-market">Mid-Market</SelectItem>
            <SelectItem value="small-business">Small Business</SelectItem>
            <SelectItem value="startup">Startup</SelectItem>
          </Select>
        </div>

        <div>
          <Text>Channel</Text>
          <Select
            value={filters.channel || ''}
            onValueChange={handleChannelChange}
            className="mt-1"
          >
            <SelectItem value="">All Channels</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsFilters; 