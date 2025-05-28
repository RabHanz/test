import React, { useState } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button, ProgressBar } from '@tremor/react';
import { FiCheck, FiAlertCircle, FiRefreshCw, FiUsers, FiServer } from 'react-icons/fi';

interface StagingTest {
  id: string;
  category: 'environment' | 'stakeholder';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  lastChecked?: Date;
  error?: string;
  assignedTo?: string;
}

interface LaunchStagingProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const LaunchStaging: React.FC<LaunchStagingProps> = ({ onStatusUpdate }) => {
  const [stagingTests, setStagingTests] = useState<StagingTest[]>([
    // Environment Tests
    {
      id: 'prod-mirror',
      category: 'environment',
      title: 'Production Mirror',
      description: 'Verify exact replica of production environment',
      status: 'pending'
    },
    {
      id: 'data-migration',
      category: 'environment',
      title: 'Data Migration',
      description: 'Test real data migration procedures',
      status: 'pending'
    },
    {
      id: 'performance-test',
      category: 'environment',
      title: 'Performance Testing',
      description: 'Load testing under production conditions',
      status: 'pending'
    },
    {
      id: 'security-test',
      category: 'environment',
      title: 'Security Testing',
      description: 'Validate security with production configs',
      status: 'pending'
    },
    {
      id: 'integration-test',
      category: 'environment',
      title: 'Integration Testing',
      description: 'Test with live third-party services',
      status: 'pending'
    },
    {
      id: 'backup-recovery',
      category: 'environment',
      title: 'Backup & Recovery',
      description: 'Validate backup and recovery procedures',
      status: 'pending'
    },

    // Stakeholder Tests
    {
      id: 'internal-review',
      category: 'stakeholder',
      title: 'Internal Team Review',
      description: 'Final review and approval by internal team',
      status: 'pending'
    },
    {
      id: 'client-beta',
      category: 'stakeholder',
      title: 'Client Beta Testing',
      description: 'Key client participation in beta testing',
      status: 'pending'
    },
    {
      id: 'expert-feedback',
      category: 'stakeholder',
      title: 'Industry Expert Review',
      description: 'Feedback from industry experts',
      status: 'pending'
    },
    {
      id: 'accessibility-review',
      category: 'stakeholder',
      title: 'Accessibility Review',
      description: 'Expert accessibility testing and validation',
      status: 'pending'
    },
    {
      id: 'legal-review',
      category: 'stakeholder',
      title: 'Legal & Compliance',
      description: 'Final legal and compliance review',
      status: 'pending'
    },
    {
      id: 'performance-benchmark',
      category: 'stakeholder',
      title: 'Performance Benchmark',
      description: 'Validate against performance benchmarks',
      status: 'pending'
    }
  ]);

  const updateTestStatus = (id: string, status: StagingTest['status'], progress?: number, error?: string) => {
    setStagingTests(prev => 
      prev.map(test => 
        test.id === id 
          ? { ...test, status, progress, error, lastChecked: new Date() }
          : test
      )
    );

    // Update overall category status
    const categories = ['environment', 'stakeholder'];
    categories.forEach(category => {
      const categoryTests = stagingTests.filter(test => test.category === category);
      const allCompleted = categoryTests.every(test => test.status === 'completed');
      onStatusUpdate(category === 'environment' ? 'stagingEnvironment' : 'stakeholderTesting', allCompleted);
    });
  };

  const getStatusBadge = (status: StagingTest['status']) => {
    const statusConfig = {
      pending: { color: 'gray', icon: <FiAlertCircle className="w-4 h-4" /> },
      'in-progress': { color: 'yellow', icon: <FiRefreshCw className="w-4 h-4 animate-spin" /> },
      completed: { color: 'green', icon: <FiCheck className="w-4 h-4" /> },
      failed: { color: 'red', icon: <FiAlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: StagingTest['category']) => {
    return category === 'environment' ? (
      <FiServer className="w-5 h-5" />
    ) : (
      <FiUsers className="w-5 h-5" />
    );
  };

  return (
    <div className="space-y-6">
      {['environment', 'stakeholder'].map(category => (
        <Card key={category} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {getCategoryIcon(category as StagingTest['category'])}
            <Title className="capitalize">{category} Testing</Title>
          </div>
          <List>
            {stagingTests
              .filter(test => test.category === category)
              .map(test => (
                <ListItem key={test.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text className="font-medium">{test.title}</Text>
                      <Text className="text-gray-500">{test.description}</Text>
                      {test.error && (
                        <Text className="text-red-500 mt-1">{test.error}</Text>
                      )}
                      {test.lastChecked && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Last checked: {test.lastChecked.toLocaleString()}
                        </Text>
                      )}
                      {test.progress !== undefined && (
                        <div className="mt-2">
                          <ProgressBar value={test.progress} color="blue" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => updateTestStatus(test.id, 'in-progress', 0)}
                      >
                        Start Test
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
          </List>
        </Card>
      ))}
    </div>
  );
};

export default LaunchStaging; 