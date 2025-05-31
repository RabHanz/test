import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useABTesting } from '../../hooks/useABTesting';
import { ABTest, ABTestStatus } from '../../types/testing';

interface ABTestManagerProps {
  personaType?: string;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({ personaType }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const { getTests, createTest, updateTest, deleteTest, startTest, stopTest } = useABTesting({
    personaType,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    variantA: '',
    variantB: '',
    targetAudience: '',
  });

  const loadTests = async () => {
    setLoading(true);
    try {
      const testList = await getTests();
      setTests(testList);
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleOpenDialog = (test?: ABTest) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        description: test.description,
        variantA: test.variantA,
        variantB: test.variantB,
        targetAudience: test.targetAudience,
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: '',
        description: '',
        variantA: '',
        variantB: '',
        targetAudience: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTest(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTest) {
        await updateTest(editingTest.id, formData);
      } else {
        await createTest(formData);
      }
      handleCloseDialog();
      loadTests();
    } catch (error) {
      console.error('Error saving A/B test:', error);
    }
  };

  const handleDelete = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(testId);
        loadTests();
      } catch (error) {
        console.error('Error deleting A/B test:', error);
      }
    }
  };

  const handleStatusChange = async (testId: string, status: ABTestStatus) => {
    try {
      if (status === ABTestStatus.RUNNING) {
        await startTest(testId);
      } else {
        await stopTest(testId);
      }
      loadTests();
    } catch (error) {
      console.error('Error changing test status:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">A/B Tests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Test
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} key={test.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{test.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {test.description}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(test)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(test.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={test.status === ABTestStatus.RUNNING ? 'Stop' : 'Start'}
                    >
                      <IconButton
                        onClick={() =>
                          handleStatusChange(
                            test.id,
                            test.status === ABTestStatus.RUNNING
                              ? ABTestStatus.PAUSED
                              : ABTestStatus.RUNNING
                          )
                        }
                      >
                        {test.status === ABTestStatus.RUNNING ? (
                          <StopIcon />
                        ) : (
                          <StartIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="body2">
                    Status:{' '}
                    <Typography
                      component="span"
                      color={
                        test.status === ABTestStatus.RUNNING
                          ? 'success.main'
                          : 'text.secondary'
                      }
                    >
                      {test.status}
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    Target Audience: {test.targetAudience}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTest ? 'Edit A/B Test' : 'Create New A/B Test'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Test Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Variant A"
              value={formData.variantA}
              onChange={(e) =>
                setFormData({ ...formData, variantA: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Variant B"
              value={formData.variantB}
              onChange={(e) =>
                setFormData({ ...formData, variantB: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                label="Target Audience"
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="new">New Users</MenuItem>
                <MenuItem value="returning">Returning Users</MenuItem>
                {personaType && (
                  <MenuItem value={personaType}>
                    {personaType} Persona
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ABTestManager; 