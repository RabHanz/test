import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { IntegrationTest } from '../../types/integration';

interface TestsTabPanelProps {
  tests: IntegrationTest[];
  onAdd: (test: Omit<IntegrationTest, 'id'>) => Promise<void>;
  onUpdate: (id: string, test: Partial<IntegrationTest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRun: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
}

export const TestsTabPanel: React.FC<TestsTabPanelProps> = ({
  tests,
  onAdd,
  onUpdate,
  onDelete,
  onRun,
  onStop,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTest, setSelectedTest] = React.useState<IntegrationTest | null>(null);
  const [newTest, setNewTest] = React.useState<Omit<IntegrationTest, 'id'>>({
    name: '',
    description: '',
    type: 'UNIT',
    status: 'NOT_STARTED',
  });

  const handleAddClick = () => {
    setNewTest({
      name: '',
      description: '',
      type: 'UNIT',
      status: 'NOT_STARTED',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (test: IntegrationTest) => {
    setSelectedTest(test);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      await onDelete(id);
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newTest);
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (selectedTest) {
      await onUpdate(selectedTest.id, selectedTest);
      setIsEditDialogOpen(false);
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'info';
      case 'NOT_STARTED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      case 'RUNNING':
        return <ScheduleIcon color="info" />;
      case 'NOT_STARTED':
        return <WarningIcon color="warning" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'UNIT':
        return 'primary';
      case 'INTEGRATION':
        return 'secondary';
      case 'E2E':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tests</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Test
          </Button>
        </Box>

        <List>
          {tests.length > 0 ? (
            tests.map((test, index) => (
              <React.Fragment key={test.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>{getTestStatusIcon(test.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{test.name}</Typography>
                        <Chip
                          label={test.type}
                          color={getTestTypeColor(test.type) as any}
                          size="small"
                        />
                        <Chip
                          label={test.status}
                          color={getTestStatusColor(test.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {test.description}
                        </Typography>
                        {test.lastRunAt && (
                          <Typography variant="body2" color="text.secondary">
                            Last run: {formatTimestamp(test.lastRunAt)}
                          </Typography>
                        )}
                        {test.status === 'RUNNING' && (
                          <LinearProgress sx={{ mt: 1 }} />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {test.status === 'RUNNING' ? (
                      <Tooltip title="Stop">
                        <IconButton
                          edge="end"
                          onClick={() => onStop(test.id)}
                          sx={{ mr: 1 }}
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Run">
                        <IconButton
                          edge="end"
                          onClick={() => onRun(test.id)}
                          sx={{ mr: 1 }}
                        >
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(test)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(test.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No tests"
                secondary="Add tests to your integration"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add Test Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add Test</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newTest.name}
            onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTest.description}
            onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={newTest.type}
              label="Type"
              onChange={(e) => setNewTest({ ...newTest, type: e.target.value as any })}
            >
              <MenuItem value="UNIT">Unit Test</MenuItem>
              <MenuItem value="INTEGRATION">Integration Test</MenuItem>
              <MenuItem value="E2E">End-to-End Test</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Test</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                value={selectedTest.name}
                onChange={(e) =>
                  setSelectedTest({ ...selectedTest, name: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={selectedTest.description}
                onChange={(e) =>
                  setSelectedTest({ ...selectedTest, description: e.target.value })
                }
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedTest.type}
                  label="Type"
                  onChange={(e) =>
                    setSelectedTest({
                      ...selectedTest,
                      type: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="UNIT">Unit Test</MenuItem>
                  <MenuItem value="INTEGRATION">Integration Test</MenuItem>
                  <MenuItem value="E2E">End-to-End Test</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 