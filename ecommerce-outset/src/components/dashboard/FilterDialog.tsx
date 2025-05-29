import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { IntegrationFilter, IntegrationStatus, IntegrationType, IntegrationProtocol } from '../../types/integration';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filter: IntegrationFilter) => void;
  initialFilter?: IntegrationFilter;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApply,
  initialFilter = {},
}) => {
  const [filter, setFilter] = React.useState<IntegrationFilter>(initialFilter);

  const handleChange = (field: keyof IntegrationFilter) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFilter((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleApply = () => {
    onApply(filter);
    onClose();
  };

  const handleReset = () => {
    setFilter({});
    onApply({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Integrations</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search"
              value={filter.search || ''}
              onChange={handleChange('search')}
              placeholder="Search by name or description"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.status || ''}
                onChange={handleChange('status')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(IntegrationStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filter.type || ''}
                onChange={handleChange('type')}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(IntegrationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={filter.protocol || ''}
                onChange={handleChange('protocol')}
                label="Protocol"
              >
                <MenuItem value="">All</MenuItem>
                {Object.values(IntegrationProtocol).map((protocol) => (
                  <MenuItem key={protocol} value={protocol}>
                    {protocol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filter.startDate ? new Date(filter.startDate).toISOString().split('T')[0] : ''}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filter.endDate ? new Date(filter.endDate).toISOString().split('T')[0] : ''}
              onChange={handleChange('endDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 