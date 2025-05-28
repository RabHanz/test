import React, { useState } from 'react';
import { Card, Title, Text, Button, Select, SelectItem } from '@tremor/react';
import { FiDownload, FiFileText, FiTable } from 'react-icons/fi';

interface AnalyticsExportProps {
  onExport: (format: string) => Promise<void>;
  isLoading?: boolean;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({
  onExport,
  isLoading = false,
}) => {
  const [format, setFormat] = useState('csv');

  const handleExport = async () => {
    try {
      await onExport(format);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FiTable className="w-5 h-5" />;
      case 'pdf':
        return <FiFileText className="w-5 h-5" />;
      default:
        return <FiDownload className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <Title>Export Analytics</Title>
      <div className="mt-4 space-y-4">
        <div>
          <Text>Export Format</Text>
          <Select
            value={format}
            onValueChange={setFormat}
            className="mt-1"
          >
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
          </Select>
        </div>

        <Button
          onClick={handleExport}
          disabled={isLoading}
          className="w-full"
          icon={getFormatIcon(format)}
        >
          {isLoading ? 'Exporting...' : 'Export Data'}
        </Button>

        <Text className="text-sm text-gray-500">
          Export includes all current analytics data based on selected filters.
          The export process may take a few moments depending on the data size.
        </Text>
      </div>
    </Card>
  );
};

export default AnalyticsExport; 