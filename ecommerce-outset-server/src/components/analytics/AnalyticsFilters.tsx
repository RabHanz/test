import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DateRangeSelector } from './DateRangeSelector';

interface FilterOption {
  label: string;
  value: string;
}

interface AnalyticsFiltersProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  filters: {
    [key: string]: {
      label: string;
      value: string;
      options: FilterOption[];
      onChange: (value: string) => void;
    };
  };
  activeFilters: {
    [key: string]: string;
  };
  onFilterRemove: (filterKey: string) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  filters,
  activeFilters,
  onFilterRemove,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Date Range
            </Typography>
            <DateRangeSelector
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateRangeChange={onDateRangeChange}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Filters
            </Typography>
            <Stack spacing={2}>
              {Object.entries(filters).map(([key, filter]) => (
                <FormControl key={key} fullWidth>
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={activeFilters[key] || ''}
                    label={filter.label}
                    onChange={(e) => filter.onChange(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          </Box>

          {Object.keys(activeFilters).length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Active Filters
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(activeFilters).map(([key, value]) => {
                  const filter = filters[key];
                  const option = filter.options.find((opt) => opt.value === value);
                  return (
                    <Chip
                      key={key}
                      label={`${filter.label}: ${option?.label || value}`}
                      onDelete={() => onFilterRemove(key)}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}; 