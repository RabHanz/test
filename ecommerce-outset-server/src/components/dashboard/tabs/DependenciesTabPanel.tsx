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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { IntegrationDependency } from '../../types/integration';

interface DependenciesTabPanelProps {
  dependencies: IntegrationDependency[];
  onAdd: (dependency: Omit<IntegrationDependency, 'id'>) => Promise<void>;
  onUpdate: (id: string, dependency: Partial<IntegrationDependency>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const DependenciesTabPanel: React.FC<DependenciesTabPanelProps> = ({
  dependencies,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedDependency, setSelectedDependency] = React.useState<IntegrationDependency | null>(null);
  const [newDependency, setNewDependency] = React.useState<Omit<IntegrationDependency, 'id'>>({
    name: '',
    version: '',
    type: 'LIBRARY',
  });

  const handleAddClick = () => {
    setNewDependency({
      name: '',
      version: '',
      type: 'LIBRARY',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (dependency: IntegrationDependency) => {
    setSelectedDependency(dependency);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dependency?')) {
      await onDelete(id);
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newDependency);
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (selectedDependency) {
      await onUpdate(selectedDependency.id, selectedDependency);
      setIsEditDialogOpen(false);
    }
  };

  const getDependencyIcon = (type: string) => {
    switch (type) {
      case 'LIBRARY':
        return <CodeIcon />;
      case 'DATABASE':
        return <StorageIcon />;
      case 'API':
        return <ApiIcon />;
      default:
        return <LinkIcon />;
    }
  };

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'LIBRARY':
        return 'primary';
      case 'DATABASE':
        return 'secondary';
      case 'API':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Dependencies</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Dependency
          </Button>
        </Box>

        <List>
          {dependencies.length > 0 ? (
            dependencies.map((dependency, index) => (
              <React.Fragment key={dependency.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>{getDependencyIcon(dependency.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{dependency.name}</Typography>
                        <Chip
                          label={dependency.type}
                          color={getDependencyTypeColor(dependency.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={`Version: ${dependency.version}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(dependency)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(dependency.id)}
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
                primary="No dependencies"
                secondary="Add dependencies to your integration"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add Dependency Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add Dependency</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newDependency.name}
            onChange={(e) => setNewDependency({ ...newDependency, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Version"
            fullWidth
            value={newDependency.version}
            onChange={(e) => setNewDependency({ ...newDependency, version: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={newDependency.type}
              label="Type"
              onChange={(e) => setNewDependency({ ...newDependency, type: e.target.value as any })}
            >
              <MenuItem value="LIBRARY">Library</MenuItem>
              <MenuItem value="DATABASE">Database</MenuItem>
              <MenuItem value="API">API</MenuItem>
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

      {/* Edit Dependency Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Dependency</DialogTitle>
        <DialogContent>
          {selectedDependency && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                value={selectedDependency.name}
                onChange={(e) =>
                  setSelectedDependency({ ...selectedDependency, name: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Version"
                fullWidth
                value={selectedDependency.version}
                onChange={(e) =>
                  setSelectedDependency({ ...selectedDependency, version: e.target.value })
                }
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedDependency.type}
                  label="Type"
                  onChange={(e) =>
                    setSelectedDependency({
                      ...selectedDependency,
                      type: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="LIBRARY">Library</MenuItem>
                  <MenuItem value="DATABASE">Database</MenuItem>
                  <MenuItem value="API">API</MenuItem>
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