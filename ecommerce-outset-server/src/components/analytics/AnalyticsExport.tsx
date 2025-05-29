import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';
export type ExportSchedule = 'daily' | 'weekly' | 'monthly';

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  schedule?: ExportSchedule;
  lastExported?: Date;
  isScheduled: boolean;
}

interface AnalyticsExportProps {
  options: ExportOption[];
  loading?: boolean;
  onExport: (optionId: string) => void;
  onSchedule: (optionId: string, schedule: ExportSchedule | null) => void;
  onDelete: (optionId: string) => void;
}

export const AnalyticsExport: React.FC<AnalyticsExportProps> = ({
  options,
  loading = false,
  onExport,
  onSchedule,
  onDelete,
}) => {
  const [selectedOption, setSelectedOption] = React.useState<ExportOption | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [schedule, setSchedule] = React.useState<ExportSchedule>('daily');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, option: ExportOption) => {
    setSelectedOption(option);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedOption(null);
  };

  const handleScheduleClick = () => {
    setScheduleDialogOpen(true);
    handleMenuClose();
  };

  const handleScheduleClose = () => {
    setScheduleDialogOpen(false);
  };

  const handleScheduleSave = () => {
    if (selectedOption) {
      onSchedule(selectedOption.id, schedule);
    }
    handleScheduleClose();
  };

  const handleScheduleCancel = () => {
    if (selectedOption) {
      onSchedule(selectedOption.id, null);
    }
    handleScheduleClose();
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return '📊';
      case 'excel':
        return '📈';
      case 'pdf':
        return '📄';
      case 'json':
        return '📋';
    }
  };

  return (
    <Card>
      <CardHeader
        title="Export Options"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading export options...</Typography>
        ) : options.length === 0 ? (
          <Typography color="text.secondary">No export options available</Typography>
        ) : (
          <Stack spacing={2}>
            {options.map((option) => (
              <Box
                key={option.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {getFormatIcon(option.format)} {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                  {option.lastExported && (
                    <Typography variant="caption" color="text.secondary">
                      Last exported: {new Date(option.lastExported).toLocaleString()}
                    </Typography>
                  )}
                  {option.isScheduled && option.schedule && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Scheduled: {option.schedule}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => onExport(option.id)}
                  >
                    Export
                  </Button>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, option)}
                    aria-label="more options"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleScheduleClick}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Schedule Export
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedOption) {
              onDelete(selectedOption.id);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={scheduleDialogOpen} onClose={handleScheduleClose}>
        <DialogTitle>Schedule Export</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedOption?.isScheduled || false}
                      onChange={(e) => {
                        if (selectedOption) {
                          onSchedule(
                            selectedOption.id,
                            e.target.checked ? schedule : null
                          );
                        }
                      }}
                    />
                  }
                  label="Enable scheduled export"
                />
              </FormGroup>
            </FormControl>

            {selectedOption?.isScheduled && (
              <FormControl fullWidth>
                <TextField
                  select
                  label="Schedule"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value as ExportSchedule)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </TextField>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleCancel}>Cancel</Button>
          <Button onClick={handleScheduleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}; 