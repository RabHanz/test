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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Group as GroupIcon,
  VideoLibrary as VideoLibraryIcon,
  Quiz as QuizIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface MasterProgramProps {
  program?: ClientProgram;
}

const MasterProgram: React.FC<MasterProgramProps> = ({ program }) => {
  const progress = program?.progress || {
    overallProgress: 0,
    clickupProgress: 0,
    learningProgress: 0,
    sessionAttendance: 0,
    communityEngagement: 0,
    resourceUtilization: 0,
    lastUpdated: new Date(),
  };

  const currentModule = {
    title: 'Advanced Business Strategy',
    progress: 65,
    lessons: [
      { title: 'Strategic Planning Fundamentals', status: 'completed' },
      { title: 'Market Analysis Techniques', status: 'completed' },
      { title: 'Competitive Advantage Development', status: 'in-progress' },
      { title: 'Growth Strategy Implementation', status: 'pending' },
    ],
  };

  const achievements = [
    {
      title: 'Business Fundamentals',
      icon: <SchoolIcon />,
      status: 'completed',
      date: '2024-02-15',
    },
    {
      title: 'Market Analysis Expert',
      icon: <MenuBookIcon />,
      status: 'completed',
      date: '2024-02-28',
    },
    {
      title: 'Strategic Planning',
      icon: <AssignmentIcon />,
      status: 'in-progress',
      date: 'In Progress',
    },
    {
      title: 'Leadership Mastery',
      icon: <EmojiEventsIcon />,
      status: 'pending',
      date: 'Upcoming',
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
          <SchoolIcon />
        </Avatar>
        <Box>
          <Typography variant="h4">Master Program</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive business education and skill development
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Current Module */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Module: {currentModule.title}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={currentModule.progress}
                sx={{ height: 8, borderRadius: 4, mb: 3 }}
              />
              <List>
                {currentModule.lessons.map((lesson) => (
                  <React.Fragment key={lesson.title}>
                    <ListItem>
                      <ListItemIcon>
                        {lesson.status === 'completed' ? (
                          <EmojiEventsIcon color="success" />
                        ) : lesson.status === 'in-progress' ? (
                          <TimelineIcon color="primary" />
                        ) : (
                          <MenuBookIcon color="disabled" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={lesson.title}
                        secondary={
                          <Chip
                            size="small"
                            label={lesson.status}
                            color={
                              lesson.status === 'completed'
                                ? 'success'
                                : lesson.status === 'in-progress'
                                ? 'primary'
                                : 'default'
                            }
                          />
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="contained"
                startIcon={<VideoLibraryIcon />}
                fullWidth
                sx={{ mt: 2 }}
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              <List>
                {achievements.map((achievement) => (
                  <ListItem key={achievement.title}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor:
                            achievement.status === 'completed'
                              ? 'success.main'
                              : achievement.status === 'in-progress'
                              ? 'primary.main'
                              : 'grey.300',
                        }}
                      >
                        {achievement.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.title}
                      secondary={achievement.date}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Learning Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Learning Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Course Materials
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Access comprehensive course materials, including video lectures, reading materials, and case studies.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    View Materials
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Study Groups
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Join study groups to collaborate with peers and discuss course materials.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Join Study Group
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Expert Mentorship
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Schedule one-on-one sessions with industry experts and mentors.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Book Session
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Assessment Center */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assessment Center
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <QuizIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle1">
                            Module Assessment
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Test your knowledge of the current module
                          </Typography>
                        </Box>
                      </Stack>
                      <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                        Take Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <GroupIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle1">
                            Group Project
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Collaborate with peers on practical assignments
                          </Typography>
                        </Box>
                      </Stack>
                      <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                        View Projects
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MasterProgram; 