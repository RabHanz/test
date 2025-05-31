import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Add as AddIcon,
  Export as ExportIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import * as leadService from '../../services/leadService';
import {
  LeadProject,
  LeadCommunication,
  LeadNote,
  LeadTask,
  LeadDocument,
  LeadMetric,
  LeadTag,
  LeadFilter,
  LeadMetrics,
  LeadAlert,
  LeadTimelineEvent,
  LeadStatus,
  LeadSource,
  LeadPriority,
  CommunicationType,
} from '../../types/lead';

interface Props {
  userRole: string;
  accessLevel: string;
}

const ConsolidatedLeadManagementDashboard: React.FC<Props> = ({ userRole, accessLevel }) => {
  // State management
  const [leads, setLeads] = useState<LeadProject[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadProject | null>(null);
  const [communications, setCommunications] = useState<LeadCommunication[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [documents, setDocuments] = useState<LeadDocument[]>([]);
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
  const [alerts, setAlerts] = useState<LeadAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<LeadFilter>({});
  const [newLead, setNewLead] = useState<Partial<LeadProject>>({
    status: LeadStatus.NEW,
    priority: LeadPriority.MEDIUM,
  });

  // Load initial data
  useEffect(() => {
    loadData();
    const unsubscribe = leadService.subscribeToUpdates(handleRealTimeUpdate);
    return () => {
      leadService.unsubscribeFromUpdates();
    };
  }, []);

  // Load data when filter changes
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, metricsData, alertsData] = await Promise.all([
        leadService.getLeads(filter),
        leadService.getLeadMetrics(),
        leadService.getAlerts(),
      ]);
      setLeads(leadsData);
      setMetrics(metricsData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    if (data.type === 'LEAD') {
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === data.id ? { ...lead, ...data } : lead
        )
      );
    }
  };

  const handleLeadSelect = async (lead: LeadProject) => {
    setSelectedLead(lead);
    try {
      const [communicationsData, notesData, tasksData, documentsData] = await Promise.all([
        leadService.getCommunications(lead.id),
        leadService.getNotes(lead.id),
        leadService.getTasks(lead.id),
        leadService.getDocuments(lead.id),
      ]);
      setCommunications(communicationsData);
      setNotes(notesData);
      setTasks(tasksData);
      setDocuments(documentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFilterApply = (newFilter: LeadFilter) => {
    setFilter(newFilter);
    setFilterDialogOpen(false);
  };

  const handleCreateLead = async () => {
    try {
      const createdLead = await leadService.createLead(newLead);
      setLeads(prevLeads => [...prevLeads, createdLead]);
      setCreateDialogOpen(false);
      setNewLead({
        status: LeadStatus.NEW,
        priority: LeadPriority.MEDIUM,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (!selectedLead) return;
    try {
      const blob = await leadService.exportLeadData(selectedLead.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-${selectedLead.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return 'info';
      case LeadStatus.CONTACTED:
        return 'primary';
      case LeadStatus.QUALIFIED:
        return 'success';
      case LeadStatus.PROPOSAL:
        return 'warning';
      case LeadStatus.NEGOTIATION:
        return 'secondary';
      case LeadStatus.CLOSED_WON:
        return 'success';
      case LeadStatus.CLOSED_LOST:
        return 'error';
      case LeadStatus.ON_HOLD:
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: LeadPriority) => {
    switch (priority) {
      case LeadPriority.LOW:
        return 'success';
      case LeadPriority.MEDIUM:
        return 'info';
      case LeadPriority.HIGH:
        return 'warning';
      case LeadPriority.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Lead Management Dashboard</Typography>
        <Box>
          <IconButton onClick={() => setFilterDialogOpen(true)}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={() => setCreateDialogOpen(true)}>
            <AddIcon />
          </IconButton>
          <IconButton onClick={() => handleExport('csv')}>
            <ExportIcon />
          </IconButton>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Metrics Overview */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Leads
                </Typography>
                <Typography variant="h5">
                  {metrics.overallMetrics.totalLeads}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Leads
                </Typography>
                <Typography variant="h5">
                  {metrics.overallMetrics.activeLeads}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Conversion Rate
                </Typography>
                <Typography variant="h5">
                  {metrics.overallMetrics.conversionRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Value
                </Typography>
                <Typography variant="h5">
                  ${metrics.overallMetrics.averageValue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Lead List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <List>
              {leads.map(lead => (
                <ListItem
                  key={lead.id}
                  button
                  selected={selectedLead?.id === lead.id}
                  onClick={() => handleLeadSelect(lead)}
                >
                  <ListItemText
                    primary={lead.name}
                    secondary={
                      <Box>
                        <Chip
                          label={lead.status}
                          size="small"
                          color={getStatusColor(lead.status)}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={lead.priority}
                          size="small"
                          color={getPriorityColor(lead.priority)}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Lead Details */}
        <Grid item xs={12} md={8}>
          {selectedLead ? (
            <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label="Overview" />
                  <Tab label="Communications" />
                  <Tab label="Notes" />
                  <Tab label="Tasks" />
                  <Tab label="Documents" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        <BusinessIcon sx={{ mr: 1 }} />
                        Company Information
                      </Typography>
                      <Typography>Company: {selectedLead.companyName}</Typography>
                      <Typography>Contact: {selectedLead.contactName}</Typography>
                      <Typography>Email: {selectedLead.contactEmail}</Typography>
                      <Typography>Phone: {selectedLead.contactPhone}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        <MoneyIcon sx={{ mr: 1 }} />
                        Deal Information
                      </Typography>
                      <Typography>
                        Expected Value: ${selectedLead.expectedValue}
                      </Typography>
                      <Typography>
                        Expected Close Date:{' '}
                        {selectedLead.expectedCloseDate?.toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Communications Tab */}
              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {communications.map(comm => (
                      <ListItem key={comm.id}>
                        <ListItemText
                          primary={comm.type}
                          secondary={
                            <>
                              <Typography variant="body2">{comm.content}</Typography>
                              <Typography variant="caption">
                                {new Date(comm.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Notes Tab */}
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {notes.map(note => (
                      <ListItem key={note.id}>
                        <ListItemText
                          primary={note.content}
                          secondary={new Date(note.createdAt).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Tasks Tab */}
              {activeTab === 3 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {tasks.map(task => (
                      <ListItem key={task.id}>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <>
                              <Typography variant="body2">{task.description}</Typography>
                              <Typography variant="caption">
                                Due: {task.dueDate?.toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Documents Tab */}
              {activeTab === 4 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {documents.map(doc => (
                      <ListItem key={doc.id}>
                        <ListItemText
                          primary={doc.name}
                          secondary={doc.type}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="textSecondary">
                Select a lead to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Filter Leads</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status || ''}
              onChange={e => setFilter({ ...filter, status: e.target.value as LeadStatus })}
            >
              {Object.values(LeadStatus).map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={filter.source || ''}
              onChange={e => setFilter({ ...filter, source: e.target.value as LeadSource })}
            >
              {Object.values(LeadSource).map(source => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filter.priority || ''}
              onChange={e => setFilter({ ...filter, priority: e.target.value as LeadPriority })}
            >
              {Object.values(LeadPriority).map(priority => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleFilterApply(filter)}>Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Create Lead Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Lead</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newLead.name || ''}
            onChange={e => setNewLead({ ...newLead, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Company Name"
            value={newLead.companyName || ''}
            onChange={e => setNewLead({ ...newLead, companyName: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Contact Name"
            value={newLead.contactName || ''}
            onChange={e => setNewLead({ ...newLead, contactName: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Contact Email"
            value={newLead.contactEmail || ''}
            onChange={e => setNewLead({ ...newLead, contactEmail: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Contact Phone"
            value={newLead.contactPhone || ''}
            onChange={e => setNewLead({ ...newLead, contactPhone: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={newLead.source || ''}
              onChange={e => setNewLead({ ...newLead, source: e.target.value as LeadSource })}
            >
              {Object.values(LeadSource).map(source => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateLead}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsolidatedLeadManagementDashboard; 