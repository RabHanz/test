import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Markdown } from '../common/Markdown';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doc-tabpanel-${index}`}
      aria-labelledby={`doc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: 'OVERVIEW' | 'API' | 'SECURITY' | 'CONFIGURATION';
  lastUpdated: string;
  updatedBy: string;
}

interface DocumentationTabPanelProps {
  sections: DocumentationSection[];
  onAdd: (section: Omit<DocumentationSection, 'id'>) => Promise<void>;
  onUpdate: (id: string, section: Partial<DocumentationSection>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const DocumentationTabPanel: React.FC<DocumentationTabPanelProps> = ({
  sections,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [tabValue, setTabValue] = React.useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<DocumentationSection | null>(null);
  const [newSection, setNewSection] = React.useState<Omit<DocumentationSection, 'id'>>({
    title: '',
    content: '',
    type: 'OVERVIEW',
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Current User', // This should be replaced with actual user info
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClick = () => {
    setNewSection({
      title: '',
      content: '',
      type: 'OVERVIEW',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Current User',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (section: DocumentationSection) => {
    setSelectedSection(section);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this documentation section?')) {
      await onDelete(id);
    }
  };

  const handleAddSubmit = async () => {
    await onAdd(newSection);
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (selectedSection) {
      await onUpdate(selectedSection.id, selectedSection);
      setIsEditDialogOpen(false);
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'OVERVIEW':
        return <DescriptionIcon />;
      case 'API':
        return <ApiIcon />;
      case 'SECURITY':
        return <SecurityIcon />;
      case 'CONFIGURATION':
        return <SettingsIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'OVERVIEW':
        return 'primary';
      case 'API':
        return 'secondary';
      case 'SECURITY':
        return 'warning';
      case 'CONFIGURATION':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredSections = sections.filter((section) => {
    switch (tabValue) {
      case 0:
        return section.type === 'OVERVIEW';
      case 1:
        return section.type === 'API';
      case 2:
        return section.type === 'SECURITY';
      case 3:
        return section.type === 'CONFIGURATION';
      default:
        return true;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="API" />
            <Tab label="Security" />
            <Tab label="Configuration" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Overview Documentation</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Section
            </Button>
          </Box>

          <List>
            {filteredSections.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{section.title}</Typography>
                        <Chip
                          label={section.type}
                          color={getSectionTypeColor(section.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Markdown content={section.content} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Last updated by {section.updatedBy} on {formatTimestamp(section.lastUpdated)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(section)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(section.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}

            {filteredSections.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No documentation sections"
                  secondary="Add documentation sections to your integration"
                />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* API Documentation Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">API Documentation</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Section
            </Button>
          </Box>

          <List>
            {filteredSections.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{section.title}</Typography>
                        <Chip
                          label={section.type}
                          color={getSectionTypeColor(section.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Markdown content={section.content} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Last updated by {section.updatedBy} on {formatTimestamp(section.lastUpdated)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(section)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(section.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}

            {filteredSections.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No API documentation"
                  secondary="Add API documentation sections to your integration"
                />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Security Documentation Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Security Documentation</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Section
            </Button>
          </Box>

          <List>
            {filteredSections.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{section.title}</Typography>
                        <Chip
                          label={section.type}
                          color={getSectionTypeColor(section.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Markdown content={section.content} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Last updated by {section.updatedBy} on {formatTimestamp(section.lastUpdated)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(section)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(section.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}

            {filteredSections.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No security documentation"
                  secondary="Add security documentation sections to your integration"
                />
              </ListItem>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Configuration Documentation Tab */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Configuration Documentation</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Section
            </Button>
          </Box>

          <List>
            {filteredSections.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{section.title}</Typography>
                        <Chip
                          label={section.type}
                          color={getSectionTypeColor(section.type) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Markdown content={section.content} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Last updated by {section.updatedBy} on {formatTimestamp(section.lastUpdated)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        onClick={() => handleEditClick(section)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(section.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}

            {filteredSections.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No configuration documentation"
                  secondary="Add configuration documentation sections to your integration"
                />
              </ListItem>
            )}
          </List>
        </TabPanel>
      </Paper>

      {/* Add Documentation Section Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Documentation Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newSection.title}
            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={10}
            value={newSection.content}
            onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Documentation Section Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Documentation Section</DialogTitle>
        <DialogContent>
          {selectedSection && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                value={selectedSection.title}
                onChange={(e) =>
                  setSelectedSection({ ...selectedSection, title: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Content"
                fullWidth
                multiline
                rows={10}
                value={selectedSection.content}
                onChange={(e) =>
                  setSelectedSection({ ...selectedSection, content: e.target.value })
                }
              />
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