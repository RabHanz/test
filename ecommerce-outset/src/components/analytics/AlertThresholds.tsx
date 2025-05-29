import React, { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';

interface AlertThreshold {
  id: string;
  name: string;
  metric: string;
  value: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  notificationChannels: string[];
}

interface AlertThresholdsProps {
  onThresholdChange?: () => void;
}

export const AlertThresholds: React.FC<AlertThresholdsProps> = ({
  onThresholdChange,
}) => {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);
  const [formData, setFormData] = useState<Partial<AlertThreshold>>({
    name: '',
    metric: '',
    value: 0,
    operator: 'gt',
    notificationChannels: [],
  });

  const { fadeIn } = useAnimations();

  const availableMetrics = [
    'conversion_rate',
    'revenue',
    'visitors',
    'bounce_rate',
    'avg_session_duration',
    'page_views',
  ];

  const operators = [
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'eq', label: 'Equal To' },
    { value: 'gte', label: 'Greater Than or Equal' },
    { value: 'lte', label: 'Less Than or Equal' },
  ];

  const notificationChannels = [
    { value: 'email', label: 'Email' },
    { value: 'slack', label: 'Slack' },
    { value: 'webhook', label: 'Webhook' },
  ];

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/alerts');
      if (!response.ok) throw new Error('Failed to fetch alert thresholds');
      const data = await response.json();
      setThresholds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching alert thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (threshold?: AlertThreshold) => {
    if (threshold) {
      setEditingThreshold(threshold);
      setFormData(threshold);
    } else {
      setEditingThreshold(null);
      setFormData({
        name: '',
        metric: '',
        value: 0,
        operator: 'gt',
        notificationChannels: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingThreshold(null);
    setFormData({
      name: '',
      metric: '',
      value: 0,
      operator: 'gt',
      notificationChannels: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingThreshold
        ? `/api/analytics/alerts?id=${editingThreshold.id}`
        : '/api/analytics/alerts';
      const method = editingThreshold ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save alert threshold');

      handleCloseDialog();
      fetchThresholds();
      onThresholdChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving alert threshold:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics/alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete alert threshold');

      fetchThresholds();
      onThresholdChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting alert threshold:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading alert thresholds...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Alert Thresholds</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          variant="contained"
        >
          Add Threshold
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {thresholds.map((threshold) => (
          <Grid item xs={12} md={6} key={threshold.id}>
            <Card
              component={motion.div}
              variants={fadeIn}
              initial="initial"
              animate="animate"
            >
              <CardHeader
                title={threshold.name}
                action={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(threshold)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(threshold.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Metric
                    </Typography>
                    <Typography variant="body1">
                      {threshold.metric.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Condition
                    </Typography>
                    <Typography variant="body1">
                      {operators.find((op) => op.value === threshold.operator)?.label}{' '}
                      {threshold.value}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Notification Channels
                    </Typography>
                    <Typography variant="body1">
                      {threshold.notificationChannels
                        .map(
                          (channel) =>
                            notificationChannels.find((c) => c.value === channel)
                              ?.label
                        )
                        .join(', ')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingThreshold ? 'Edit Alert Threshold' : 'Add Alert Threshold'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={formData.metric}
                label="Metric"
                onChange={(e) =>
                  setFormData({ ...formData, metric: e.target.value })
                }
              >
                {availableMetrics.map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {metric.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Operator</InputLabel>
              <Select
                value={formData.operator}
                label="Operator"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operator: e.target.value as AlertThreshold['operator'],
                  })
                }
              >
                {operators.map((operator) => (
                  <MenuItem key={operator.value} value={operator.value}>
                    {operator.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: Number(e.target.value) })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Notification Channels</InputLabel>
              <Select
                multiple
                value={formData.notificationChannels}
                label="Notification Channels"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: e.target.value as string[],
                  })
                }
              >
                {notificationChannels.map((channel) => (
                  <MenuItem key={channel.value} value={channel.value}>
                    {channel.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingThreshold ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 