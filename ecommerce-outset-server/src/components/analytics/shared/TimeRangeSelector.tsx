import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  Popover,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';

export type TimeRange = 'day' | 'week' | 'month' | 'custom';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  startDate: Date;
  endDate: Date;
  onRangeChange: (range: TimeRange) => void;
  onDateChange: (start: Date, end: Date) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  startDate,
  endDate,
  onRangeChange,
  onDateChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleCustomRangeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      onDateChange(date, endDate);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onDateChange(startDate, date);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <ButtonGroup variant="outlined" size="small">
        <Button
          onClick={() => onRangeChange('day')}
          variant={selectedRange === 'day' ? 'contained' : 'outlined'}
        >
          Today
        </Button>
        <Button
          onClick={() => onRangeChange('week')}
          variant={selectedRange === 'week' ? 'contained' : 'outlined'}
        >
          This Week
        </Button>
        <Button
          onClick={() => onRangeChange('month')}
          variant={selectedRange === 'month' ? 'contained' : 'outlined'}
        >
          This Month
        </Button>
        <Button
          onClick={handleCustomRangeClick}
          variant={selectedRange === 'custom' ? 'contained' : 'outlined'}
          startIcon={<CalendarIcon />}
        >
          Custom Range
        </Button>
      </ButtonGroup>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Date Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                maxDate={endDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate}
              />
            </Box>
          </LocalizationProvider>
        </Box>
      </Popover>
    </Box>
  );
}; 