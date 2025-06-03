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
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  VideoLibrary as VideoLibraryIcon,
  Event as EventIcon,
  Forum as ForumIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface LaunchProgramProps {
  program?: ClientProgram;
}

const LaunchProgram: React.FC<LaunchProgramProps> = ({ program }) => {
  const progress = program?.progress || {
    overallProgress: 0,
    clickupProgress: 0,
    learningProgress: 0,
    sessionAttendance: 0,
    communityEngagement: 0,
    resourceUtilization: 0,
    lastUpdated: new Date(),
  };

  const milestones = [
    {
      title: 'Product Research',
      progress: 75,
      status: 'in-progress',
      icon: <AssignmentIcon />,
    },
    {
      title: 'Market Analysis',
      progress: 60,
      status: 'in-progress',
      icon: <AssignmentIcon />,
    },
    {
      title: 'Launch Strategy',
      progress: 30,
      status: 'in-progress',
      icon: <AssignmentIcon />,
    },
    {
      title: 'First Sale',
      progress: 0,
      status: 'pending',
      icon: <EmojiEventsIcon />,
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <AssignmentIcon />
        </Avatar>
        <Box>
          <Typography variant="h4">Launch Program</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your 60-day journey to launching your first product
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Program Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.overallProgress}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Overall Progress: {Math.round(progress.overallProgress)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                >
                  View Today's Tasks
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoLibraryIcon />}
                  fullWidth
                >
                  Continue Learning
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  fullWidth
                >
                  Schedule Session
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Milestones */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Program Milestones
          </Typography>
          <Grid container spacing={2}>
            {milestones.map((milestone) => (
              <Grid item xs={12} md={6} lg={3} key={milestone.title}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {milestone.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                          {milestone.title}
                        </Typography>
                        <Chip
                          label={milestone.status}
                          size="small"
                          color={milestone.status === 'completed' ? 'success' : 'primary'}
                        />
                      </Box>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={milestone.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {milestone.progress}% Complete
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Program Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Product Research Templates
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Access our collection of templates for market research, competitor analysis, and product validation.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    View Templates
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Community Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Connect with other entrepreneurs in the Launch Program community.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Expert Sessions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Schedule one-on-one sessions with our launch experts.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Book Session
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

export default LaunchProgram; 