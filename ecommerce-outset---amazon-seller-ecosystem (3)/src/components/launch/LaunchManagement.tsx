import React, { useState } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Grid, Col, Badge } from '@tremor/react';
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

import PreLaunchChecklist from './PreLaunchChecklist';
import LaunchStaging from './LaunchStaging';
import SoftLaunch from './SoftLaunch';
import LaunchDay from './LaunchDay';
import CrisisManagement from './CrisisManagement';
import PostLaunchMonitoring from './PostLaunchMonitoring';
import LaunchMetrics from './LaunchMetrics';
import OptimizationFramework from './OptimizationFramework';
import LaunchCommunication from './LaunchCommunication';

interface LaunchStatus {
  preLaunchChecklist: boolean;
  launchStaging: boolean;
  softLaunch: boolean;
  launchDay: boolean;
  crisisManagement: boolean;
  postLaunchMonitoring: boolean;
  launchMetrics: boolean;
  optimizationFramework: boolean;
  launchCommunication: boolean;
}

const LaunchManagement: React.FC = () => {
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({
    preLaunchChecklist: false,
    launchStaging: false,
    softLaunch: false,
    launchDay: false,
    crisisManagement: false,
    postLaunchMonitoring: false,
    launchMetrics: false,
    optimizationFramework: false,
    launchCommunication: false
  });

  const updateStatus = (key: keyof LaunchStatus, value: boolean) => {
    setLaunchStatus(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getOverallStatus = () => {
    const allComplete = Object.values(launchStatus).every(status => status);
    const anyInProgress = Object.values(launchStatus).some(status => status);
    const noneStarted = Object.values(launchStatus).every(status => !status);

    if (allComplete) {
      return {
        status: 'complete',
        color: 'green',
        icon: <FiCheckCircle className="w-5 h-5" />,
        text: 'Launch Complete'
      };
    }
    if (anyInProgress) {
      return {
        status: 'in-progress',
        color: 'yellow',
        icon: <FiClock className="w-5 h-5" />,
        text: 'Launch In Progress'
      };
    }
    return {
      status: 'not-started',
      color: 'blue',
      icon: <FiAlertCircle className="w-5 h-5" />,
      text: 'Launch Not Started'
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Title>Launch Management</Title>
        <Badge color={overallStatus.color as any} size="lg" className="flex items-center gap-2">
          {overallStatus.icon}
          {overallStatus.text}
        </Badge>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
        {Object.entries(launchStatus).map(([key, value]) => (
          <Col key={key}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <Text className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Badge
                  color={value ? 'green' : 'yellow'}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {value ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiClock className="w-4 h-4" />
                  )}
                  {value ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>

      <TabGroup>
        <TabList className="mb-6">
          <Tab>Pre-Launch</Tab>
          <Tab>Staging</Tab>
          <Tab>Soft Launch</Tab>
          <Tab>Launch Day</Tab>
          <Tab>Post-Launch</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="space-y-6">
              <PreLaunchChecklist onStatusUpdate={updateStatus} />
              <LaunchStaging onStatusUpdate={updateStatus} />
            </div>
          </TabPanel>
          <TabPanel>
            <SoftLaunch onStatusUpdate={updateStatus} />
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <LaunchDay onStatusUpdate={updateStatus} />
              <CrisisManagement onStatusUpdate={updateStatus} />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-6">
              <PostLaunchMonitoring onStatusUpdate={updateStatus} />
              <LaunchMetrics onStatusUpdate={updateStatus} />
              <OptimizationFramework onStatusUpdate={updateStatus} />
              <LaunchCommunication onStatusUpdate={updateStatus} />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default LaunchManagement; 