import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
  Checklist as ChecklistIcon,
  Description as DocumentIcon,
  Group as TeamIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as launchService from '../../services/launchService';
import {
  LaunchProject,
  LaunchChecklist,
  LaunchValidation,
  LaunchMetric,
  LaunchTimelineEvent,
  LaunchDocument,
  LaunchTeamMember,
  LaunchFilter,
  LaunchMetrics,
  LaunchAlert,
  LaunchStatus,
  LaunchPhase,
  ValidationStatus,
  LaunchPriority,
} from '../../types/launch';

interface Props {
  userRole: string;
  accessLevel: string;
}

const ConsolidatedLaunchReadinessDashboard: React.FC<Props> = ({ userRole, accessLevel }) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState<LaunchProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<LaunchProject | null>(null);
  const [checklists, setChecklists] = useState<LaunchChecklist[]>([]);
  const [validations, setValidations] = useState<LaunchValidation[]>([]);
  const [metrics, setMetrics] = useState<LaunchMetrics | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<LaunchTimelineEvent[]>([]);
  const [documents, setDocuments] = useState<LaunchDocument[]>([]);
  const [teamMembers, setTeamMembers] = useState<LaunchTeamMember[]>([]);
  const [alerts, setAlerts] = useState<LaunchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filter, setFilter] = useState<LaunchFilter>({});
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState<Partial<LaunchProject>>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, metricsData, alertsData] = await Promise.all([
          launchService.getProjects(filter),
          selectedProject ? launchService.getProjectMetrics(selectedProject.id) : null,
          selectedProject ? launchService.getAlerts(selectedProject.id) : null,
        ]);

        setProjects(projectsData);
        if (metricsData) setMetrics(metricsData);
        if (alertsData) setAlerts(alertsData);

        if (selectedProject) {
          const [
            checklistsData,
            validationsData,
            timelineData,
            documentsData,
            teamData,
          ] = await Promise.all([
            launchService.getChecklists(selectedProject.id),
            launchService.getValidations(selectedProject.id),
            launchService.getTimelineEvents(selectedProject.id),
            launchService.getDocuments(selectedProject.id),
            launchService.getTeamMembers(selectedProject.id),
          ]);

          setChecklists(checklistsData);
          setValidations(validationsData);
          setTimelineEvents(timelineData);
          setDocuments(documentsData);
          setTeamMembers(teamData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProject, filter]);

  // Real-time updates
  useEffect(() => {
    if (selectedProject) {
      const unsubscribe = launchService.subscribeToUpdates((data) => {
        // Update relevant state based on the type of update
        switch (data.type) {
          case 'PROJECT':
            setProjects(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
            break;
          case 'CHECKLIST':
            setChecklists(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
            break;
          case 'VALIDATION':
            setValidations(prev => prev.map(v => v.id === data.id ? { ...v, ...data } : v));
            break;
          case 'TIMELINE':
            setTimelineEvents(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
            break;
          case 'ALERT':
            setAlerts(prev => [...prev, data]);
            break;
        }
      });

      return () => unsubscribe();
    }
  }, [selectedProject]);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProjectSelect = (project: LaunchProject) => {
    setSelectedProject(project);
  };

  const handleFilterChange = (newFilter: LaunchFilter) => {
    setFilter(newFilter);
    setShowFilterDialog(false);
  };

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (selectedProject) {
      try {
        const blob = await launchService.exportProjectData(selectedProject.id, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `launch-project-${selectedProject.id}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        setError('Failed to export data');
      }
    }
  };

  const handleCreateProject = async () => {
    try {
      const project = await launchService.createProject(newProject);
      setProjects(prev => [...prev, project]);
      setShowNewProjectDialog(false);
      setNewProject({});
    } catch (err) {
      setError('Failed to create project');
    }
  };

  // Render functions
  const renderProjectList = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Launch Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewProjectDialog(true)}
        >
          New Project
        </Button>
      </Box>
      <Grid container spacing={2}>
        {projects.map(project => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                bgcolor: selectedProject?.id === project.id ? 'action.selected' : 'background.paper',
              }}
              onClick={() => handleProjectSelect(project)}
            >
              <Typography variant="h6">{project.name}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {project.description}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={project.status}
                  color={
                    project.status === LaunchStatus.COMPLETED
                      ? 'success'
                      : project.status === LaunchStatus.BLOCKED
                      ? 'error'
                      : 'default'
                  }
                  size="small"
                />
                <Chip label={project.phase} size="small" />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderChecklistPanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Launch Checklist
      </Typography>
      <Grid container spacing={2}>
        {checklists.map(checklist => (
          <Grid item xs={12} key={checklist.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">{checklist.name}</Typography>
                  <Typography color="textSecondary">{checklist.description}</Typography>
                </Box>
                <Chip
                  label={checklist.status}
                  color={
                    checklist.status === ValidationStatus.PASSED
                      ? 'success'
                      : checklist.status === ValidationStatus.FAILED
                      ? 'error'
                      : 'default'
                  }
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTimelinePanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Launch Timeline
      </Typography>
      <Box sx={{ position: 'relative', height: 400, overflow: 'auto' }}>
        {timelineEvents.map(event => (
          <Paper key={event.id} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">{event.title}</Typography>
                <Typography color="textSecondary">{event.description}</Typography>
                <Typography variant="caption">
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  {event.endDate && ` - ${format(new Date(event.endDate), 'MMM dd, yyyy')}`}
                </Typography>
              </Box>
              <Chip
                label={event.status}
                color={
                  event.status === LaunchStatus.COMPLETED
                    ? 'success'
                    : event.status === LaunchStatus.BLOCKED
                    ? 'error'
                    : 'default'
                }
              />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderMetricsPanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Launch Metrics
      </Typography>
      {metrics && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Metrics
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>
                  Total Projects: {metrics.overallMetrics.totalProjects}
                </Typography>
                <Typography>
                  Active Projects: {metrics.overallMetrics.activeProjects}
                </Typography>
                <Typography>
                  Completed Projects: {metrics.overallMetrics.completedProjects}
                </Typography>
                <Typography>
                  Blocked Projects: {metrics.overallMetrics.blockedProjects}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Validation Metrics
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>
                  Total Validations: {metrics.validationMetrics.totalValidations}
                </Typography>
                <Typography>
                  Passed: {metrics.validationMetrics.passedValidations}
                </Typography>
                <Typography>
                  Failed: {metrics.validationMetrics.failedValidations}
                </Typography>
                <Typography>
                  Pending: {metrics.validationMetrics.pendingValidations}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Main render
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Launch Readiness Dashboard</Typography>
        <Box>
          <IconButton onClick={() => setShowFilterDialog(true)}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={() => handleExport('csv')}>
            <ExportIcon />
          </IconButton>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderProjectList()}

          {selectedProject && (
            <Box mt={3}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab icon={<ChecklistIcon />} label="Checklist" />
                <Tab icon={<TimelineIcon />} label="Timeline" />
                <Tab icon={<DocumentIcon />} label="Documents" />
                <Tab icon={<TeamIcon />} label="Team" />
              </Tabs>

              <Box mt={2}>
                {activeTab === 0 && renderChecklistPanel()}
                {activeTab === 1 && renderTimelinePanel()}
                {activeTab === 2 && renderMetricsPanel()}
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
        <DialogTitle>Filter Projects</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.status || ''}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as LaunchStatus })}
              >
                {Object.values(LaunchStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select
                value={filter.phase || ''}
                onChange={(e) => setFilter({ ...filter, phase: e.target.value as LaunchPhase })}
              >
                {Object.values(LaunchPhase).map((phase) => (
                  <MenuItem key={phase} value={phase}>
                    {phase}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterDialog(false)}>Cancel</Button>
          <Button onClick={() => handleFilterChange(filter)} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onClose={() => setShowNewProjectDialog(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Project Name"
              value={newProject.name || ''}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newProject.description || ''}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select
                value={newProject.phase || LaunchPhase.PLANNING}
                onChange={(e) => setNewProject({ ...newProject, phase: e.target.value as LaunchPhase })}
              >
                {Object.values(LaunchPhase).map((phase) => (
                  <MenuItem key={phase} value={phase}>
                    {phase}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewProjectDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsolidatedLaunchReadinessDashboard; 