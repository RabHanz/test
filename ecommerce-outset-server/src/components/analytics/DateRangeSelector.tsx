import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

const predefinedRanges = [
  {
    label: 'Last 7 days',
    getRange: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    getRange: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: 'Last 90 days',
    getRange: () => ({
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date(),
    }),
  },
  {
    label: 'This month',
    getRange: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(),
      };
    },
  },
  {
    label: 'Last month',
    getRange: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    },
  },
  {
    label: 'This year',
    getRange: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(),
      };
    },
  },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePredefinedRange = (range: { start: Date; end: Date }) => {
    onDateRangeChange(range.start, range.end);
    handleClose();
  };

  const handleCustomRange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      onDateRangeChange(start, end);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<CalendarIcon />}
      >
        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 400 }}>
          <Typography variant="subtitle1" gutterBottom>
            Predefined Ranges
          </Typography>
          <ButtonGroup
            orientation="vertical"
            fullWidth
            sx={{ mb: 2 }}
          >
            {predefinedRanges.map((range) => (
              <Button
                key={range.label}
                onClick={() => handlePredefinedRange(range.getRange())}
              >
                {range.label}
              </Button>
            ))}
          </ButtonGroup>

          <Typography variant="subtitle1" gutterBottom>
            Custom Range
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(date) => handleCustomRange(date, endDate)}
                maxDate={endDate}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(date) => handleCustomRange(startDate, date)}
                minDate={startDate}
              />
            </Stack>
          </LocalizationProvider>
        </Box>
      </Popover>
    </Box>
  );
}; 