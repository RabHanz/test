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
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { ProgramType, ClientProgram } from '../../../types/programs';

interface InvestProgramProps {
  program?: ClientProgram;
}

const InvestProgram: React.FC<InvestProgramProps> = ({ program }) => {
  const progress = program?.progress || {
    overallProgress: 0,
    clickupProgress: 0,
    learningProgress: 0,
    sessionAttendance: 0,
    communityEngagement: 0,
    resourceUtilization: 0,
    lastUpdated: new Date(),
  };

  const portfolioMetrics = [
    {
      title: 'Total Portfolio Value',
      value: '$2.5M',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'ROI (YTD)',
      value: '18.2%',
      change: '+3.2%',
      trend: 'up',
    },
    {
      title: 'Active Investments',
      value: '12',
      change: '+2',
      trend: 'up',
    },
    {
      title: 'Risk Score',
      value: 'Moderate',
      change: 'Stable',
      trend: 'neutral',
    },
  ];

  const investmentOpportunities = [
    {
      name: 'Tech Startup A',
      sector: 'SaaS',
      stage: 'Series A',
      amount: '$500K',
      status: 'Under Review',
      dueDate: '2024-03-20',
    },
    {
      name: 'E-commerce Platform',
      sector: 'Retail',
      stage: 'Seed',
      amount: '$250K',
      status: 'Due Diligence',
      dueDate: '2024-03-15',
    },
    {
      name: 'HealthTech Solution',
      sector: 'Healthcare',
      stage: 'Series B',
      amount: '$1M',
      status: 'Term Sheet',
      dueDate: '2024-03-25',
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
          <AccountBalanceIcon />
        </Avatar>
        <Box>
          <Typography variant="h4">Invest Program</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sophisticated investment opportunities and portfolio management
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Portfolio Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {portfolioMetrics.map((metric) => (
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
                        color={
                          metric.trend === 'up'
                            ? 'success'
                            : metric.trend === 'down'
                            ? 'error'
                            : 'default'
                        }
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

        {/* Investment Opportunities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Opportunities
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell>Sector</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investmentOpportunities.map((opportunity) => (
                      <TableRow key={opportunity.name}>
                        <TableCell>{opportunity.name}</TableCell>
                        <TableCell>{opportunity.sector}</TableCell>
                        <TableCell>{opportunity.stage}</TableCell>
                        <TableCell>{opportunity.amount}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={opportunity.status}
                            color={
                              opportunity.status === 'Term Sheet'
                                ? 'success'
                                : opportunity.status === 'Due Diligence'
                                ? 'warning'
                                : 'primary'
                            }
                          />
                        </TableCell>
                        <TableCell>{opportunity.dueDate}</TableCell>
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
                    Run Due Diligence
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShowChartIcon />}
                    fullWidth
                  >
                    View Portfolio
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TimelineIcon />}
                    fullWidth
                  >
                    Track Performance
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investment Tools
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<BarChartIcon />}
                    fullWidth
                  >
                    Market Analysis
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AttachMoneyIcon />}
                    fullWidth
                  >
                    ROI Calculator
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUpIcon />}
                    fullWidth
                  >
                    Risk Assessment
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Investment Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Investment Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Due Diligence Templates
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Access comprehensive due diligence checklists and templates for investment evaluation.
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
                    Investment Network
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Connect with other investors and access exclusive deal flow opportunities.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Join Network
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Expert Consultations
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Schedule sessions with investment experts and industry specialists.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Book Consultation
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

export default InvestProgram; 