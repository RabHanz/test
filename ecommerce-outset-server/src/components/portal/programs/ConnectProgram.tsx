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
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Forum as ForumIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface ConnectProgramProps {
  program?: ClientProgram;
}

const ConnectProgram: React.FC<ConnectProgramProps> = ({ program }) => {
  const progress = program?.progress || {
    overallProgress: 0,
    clickupProgress: 0,
    learningProgress: 0,
    sessionAttendance: 0,
    communityEngagement: 0,
    resourceUtilization: 0,
    lastUpdated: new Date(),
  };

  const networkStats = [
    {
      title: 'Total Connections',
      value: '248',
      change: '+12',
      trend: 'up',
    },
    {
      title: 'Active Groups',
      value: '8',
      change: '+2',
      trend: 'up',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      change: '0',
      trend: 'neutral',
    },
    {
      title: 'Message Response Rate',
      value: '92%',
      change: '+5%',
      trend: 'up',
    },
  ];

  const recentConnections = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Consultant',
      company: 'Growth Strategies Inc.',
      status: 'Connected',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Supply Chain Expert',
      company: 'Global Logistics Co.',
      status: 'Pending',
      avatar: 'MC',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Marketing Director',
      company: 'Digital Solutions Ltd.',
      status: 'Connected',
      avatar: 'ER',
    },
  ];

  const upcomingEvents = [
    {
      title: 'E-commerce Mastermind',
      date: '2024-03-15',
      time: '10:00 AM',
      type: 'Virtual',
      participants: 24,
    },
    {
      title: 'Supply Chain Workshop',
      date: '2024-03-20',
      time: '2:00 PM',
      type: 'Hybrid',
      participants: 18,
    },
    {
      title: 'Networking Mixer',
      date: '2024-03-25',
      time: '6:00 PM',
      type: 'In-Person',
      participants: 45,
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
          <PeopleIcon />
        </Avatar>
        <Box>
          <Typography variant="h4">Connect Program</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Build your professional network and grow your business
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Network Stats */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {networkStats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={stat.change}
                        color={
                          stat.trend === 'up'
                            ? 'success'
                            : stat.trend === 'down'
                            ? 'error'
                            : 'default'
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        this month
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Connections */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Connections
              </Typography>
              <List>
                {recentConnections.map((connection) => (
                  <React.Fragment key={connection.name}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>{connection.avatar}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={connection.name}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {connection.role}
                            </Typography>
                            {' — '}
                            {connection.company}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          size="small"
                          label={connection.status}
                          color={connection.status === 'Connected' ? 'success' : 'warning'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                fullWidth
                sx={{ mt: 2 }}
              >
                Find More Connections
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List>
                {upcomingEvents.map((event) => (
                  <React.Fragment key={event.title}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {event.date} at {event.time}
                            </Typography>
                            {' — '}
                            {event.type} • {event.participants} participants
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button size="small" variant="outlined">
                          Join
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Button
                variant="outlined"
                startIcon={<EventIcon />}
                fullWidth
                sx={{ mt: 2 }}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    startIcon={<MessageIcon />}
                    fullWidth
                  >
                    Send Message
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<GroupIcon />}
                    fullWidth
                  >
                    Create Group
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    fullWidth
                  >
                    Schedule Meeting
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<NotificationsIcon />}
                    fullWidth
                  >
                    Set Alerts
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Network Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Network Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Business Directory
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Access our comprehensive directory of service providers and business partners.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Browse Directory
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Community Forums
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Join industry-specific forums to discuss trends and share insights.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Join Forums
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Expert Network
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Connect with industry experts for one-on-one consultations.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Find Experts
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

export default ConnectProgram; 