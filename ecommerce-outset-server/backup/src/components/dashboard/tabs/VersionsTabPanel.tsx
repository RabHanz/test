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
  Chip,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IntegrationVersion } from '../../types/integration';

interface VersionsTabPanelProps {
  versions: IntegrationVersion[];
  onAdd: (version: Omit<IntegrationVersion, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
}

export const VersionsTabPanel: React.FC<VersionsTabPanelProps> = ({
  versions,
  onAdd,
  onDelete,
  onRestore,
  onDownload,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newVersion, setNewVersion] = React.useState<Omit<IntegrationVersion, 'id'>>({
    version: '',
    description: '',
    changes: '',
    status: 'DRAFT',
  });
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedVersion, setSelectedVersion] = React.useState<IntegrationVersion | null>(null);

  const handleAddClick = () => {
    setNewVersion({
      version: '',
      description: '',
      changes: '',
      status: 'DRAFT',
    });
    setIsAddDialogOpen(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, version: IntegrationVersion) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVersion(version);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedVersion(null);
  };

  const handleDeleteClick = async () => {
    if (selectedVersion && window.confirm('Are you sure you want to delete this version?')) {
      await onDelete(selectedVersion.id);
      handleMenuClose();
    }
  };

  const handleRestoreClick = async () => {
    if (selectedVersion) {
      await onRestore(selectedVersion.id);
      handleMenuClose();
    }
  };

  const handleDownloadClick = async () => {
    if (selectedVersion) {
      await onDownload(selectedVersion.id);
      handleMenuClose();
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newVersion);
    setIsAddDialogOpen(false);
  };

  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'DEPRECATED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVersionStatusIcon = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return <CheckCircleIcon color="success" />;
      case 'DRAFT':
        return <ScheduleIcon color="warning" />;
      case 'DEPRECATED':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Versions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Version
          </Button>
        </Box>

        <List>
          {versions.length > 0 ? (
            versions.map((version, index) => (
              <React.Fragment key={version.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>{getVersionStatusIcon(version.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">v{version.version}</Typography>
                        <Chip
                          label={version.status}
                          color={getVersionStatusColor(version.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {version.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Released by: {version.releasedBy} on {formatTimestamp(version.releasedAt)}
                        </Typography>
                        {version.changes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Changes: {version.changes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="More actions">
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, version)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No versions"
                secondary="Add versions to your integration"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Add Version Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add Version</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Version"
            fullWidth
            value={newVersion.version}
            onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newVersion.description}
            onChange={(e) => setNewVersion({ ...newVersion, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Changes"
            fullWidth
            multiline
            rows={3}
            value={newVersion.changes}
            onChange={(e) => setNewVersion({ ...newVersion, changes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRestoreClick}>
          <ListItemIcon>
            <RestoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Restore Version</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadClick}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}; 