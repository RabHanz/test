import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface ScaleProgramProps {
  program?: ClientProgram;
}

const ScaleProgram: React.FC<ScaleProgramProps> = ({ program }) => {
  const progress = program?.progress || {
    overallProgress: 0,
    clickupProgress: 0,
    learningProgress: 0,
    sessionAttendance: 0,
    communityEngagement: 0,
    resourceUtilization: 0,
    lastUpdated: new Date(),
  };

  const metrics = [
    {
      title: 'Revenue Growth',
      value: '+24.5%',
      change: '+5.2%',
      trend: 'up',
    },
    {
      title: 'Profit Margin',
      value: '32.8%',
      change: '+2.1%',
      trend: 'up',
    },
    {
      title: 'Customer Acquisition',
      value: '1,245',
      change: '+18.3%',
      trend: 'up',
    },
    {
      title: 'Operational Efficiency',
      value: '87.2%',
      change: '-1.5%',
      trend: 'down',
    },
  ];

  const optimizationTasks = [
    {
      title: 'Supply Chain Optimization',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2024-03-15',
    },
    {
      title: 'Inventory Management System',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '2024-03-20',
    },
    {
      title: 'Customer Service Automation',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2024-03-10',
    },
    {
      title: 'Marketing ROI Analysis',
      priority: 'Medium',
      status: 'Completed',
      dueDate: '2024-03-05',
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
          <TrendingUpIcon />
        </Avatar>
        <Box>
          <Typography variant="h4">Scale Program</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Data-driven optimization for business growth
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.title}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {metric.value}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={metric.change}
                        color={metric.trend === 'up' ? 'success' : 'error'}
                      />
                      <Typography variant="body2" color="text.secondary">
                        vs last month
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Optimization Tasks */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimization Tasks
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {optimizationTasks.map((task) => (
                      <TableRow key={task.title}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.priority}
                            color={task.priority === 'High' ? 'error' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={task.status}
                            color={
                              task.status === 'Completed'
                                ? 'success'
                                : task.status === 'In Progress'
                                ? 'primary'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                  >
                    Run Performance Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    fullWidth
                  >
                    View Growth Metrics
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BarChartIcon />}
                    fullWidth
                  >
                    Generate Reports
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Center
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachMoneyIcon />}
                    fullWidth
                  >
                    Financial Planning Tools
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                  >
                    Optimization Guides
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                    fullWidth
                  >
                    Growth Strategies
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScaleProgram; 