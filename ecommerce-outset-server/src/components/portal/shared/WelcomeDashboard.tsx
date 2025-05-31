import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  Rocket as RocketIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface WelcomeDashboardProps {
  clientPrograms?: ClientProgram[];
}

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ clientPrograms = [] }) => {
  const programIcons = {
    [ProgramType.LAUNCH]: <RocketIcon sx={{ fontSize: 40 }} />,
    [ProgramType.SCALE]: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    [ProgramType.MASTER]: <SchoolIcon sx={{ fontSize: 40 }} />,
    [ProgramType.INVEST]: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    [ProgramType.CONNECT]: <PeopleIcon sx={{ fontSize: 40 }} />,
  };

  const programColors = {
    [ProgramType.LAUNCH]: 'primary',
    [ProgramType.SCALE]: 'secondary',
    [ProgramType.MASTER]: 'success',
    [ProgramType.INVEST]: 'warning',
    [ProgramType.CONNECT]: 'info',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Client Portal
      </Typography>

      <Grid container spacing={3}>
        {/* Active Programs Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Your Active Programs
          </Typography>
          <Grid container spacing={2}>
            {clientPrograms.map((program) => (
              <Grid item xs={12} md={6} lg={4} key={program.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {programIcons[program.type as ProgramType]}
                      <Typography variant="h6" sx={{ ml: 2 }}>
                        {program.type} Program
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={program.progress.overallProgress}
                      color={programColors[program.type as ProgramType] as any}
                      sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Progress: {Math.round(program.progress.overallProgress)}%
                    </Typography>
                    <Button
                      variant="contained"
                      color={programColors[program.type as ProgramType] as any}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Continue Program
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Quick Access Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Access
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Projects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access your ClickUp projects and tasks
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View Projects
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Learning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continue your courses and training
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View Courses
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Calendar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule and manage your sessions
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Community
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect with peers and mentors
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WelcomeDashboard; 