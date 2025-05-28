import React, { useState } from 'react';
import { Card, Title, Text, List, ListItem, Badge, Button } from '@tremor/react';
import { FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ChecklistItem {
  id: string;
  category: 'technical' | 'application' | 'content';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  lastChecked?: Date;
  error?: string;
}

interface PreLaunchChecklistProps {
  onStatusUpdate: (key: string, value: boolean) => void;
}

const PreLaunchChecklist: React.FC<PreLaunchChecklistProps> = ({ onStatusUpdate }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    // Technical Readiness
    {
      id: 'server-infra',
      category: 'technical',
      title: 'Server Infrastructure',
      description: 'Verify server scaling and load balancing configuration',
      status: 'pending'
    },
    {
      id: 'database-optimization',
      category: 'technical',
      title: 'Database Optimization',
      description: 'Validate database performance and backup procedures',
      status: 'pending'
    },
    {
      id: 'cdn-config',
      category: 'technical',
      title: 'CDN Configuration',
      description: 'Test content delivery network setup and caching',
      status: 'pending'
    },
    {
      id: 'ssl-cert',
      category: 'technical',
      title: 'SSL Certificate',
      description: 'Verify SSL certificate installation and validation',
      status: 'pending'
    },
    {
      id: 'domain-dns',
      category: 'technical',
      title: 'Domain & DNS',
      description: 'Check domain configuration and DNS propagation',
      status: 'pending'
    },
    {
      id: 'load-balancer',
      category: 'technical',
      title: 'Load Balancer',
      description: 'Test load balancer configuration and failover',
      status: 'pending'
    },

    // Application Readiness
    {
      id: 'persona-journeys',
      category: 'application',
      title: 'Persona Journeys',
      description: 'Validate all user journey flows and interactions',
      status: 'pending'
    },
    {
      id: 'payment-processing',
      category: 'application',
      title: 'Payment Processing',
      description: 'Test end-to-end payment flow and validation',
      status: 'pending'
    },
    {
      id: 'email-automation',
      category: 'application',
      title: 'Email Automation',
      description: 'Verify email system functionality and delivery',
      status: 'pending'
    },
    {
      id: 'crm-integration',
      category: 'application',
      title: 'CRM Integration',
      description: 'Test CRM system integration and data flow',
      status: 'pending'
    },
    {
      id: 'analytics-tracking',
      category: 'application',
      title: 'Analytics Tracking',
      description: 'Validate analytics implementation and data collection',
      status: 'pending'
    },
    {
      id: 'api-integration',
      category: 'application',
      title: 'Third-party APIs',
      description: 'Test all external API integrations',
      status: 'pending'
    },

    // Content Readiness
    {
      id: 'persona-content',
      category: 'content',
      title: 'Persona Content',
      description: 'Verify all persona-specific content is published',
      status: 'pending'
    },
    {
      id: 'resource-downloads',
      category: 'content',
      title: 'Resource Downloads',
      description: 'Test resource file availability and downloads',
      status: 'pending'
    },
    {
      id: 'video-content',
      category: 'content',
      title: 'Video Content',
      description: 'Validate video uploads and streaming functionality',
      status: 'pending'
    },
    {
      id: 'faq-sections',
      category: 'content',
      title: 'FAQ Sections',
      description: 'Review and verify FAQ content accuracy',
      status: 'pending'
    },
    {
      id: 'legal-pages',
      category: 'content',
      title: 'Legal Pages',
      description: 'Ensure legal pages are updated and compliant',
      status: 'pending'
    },
    {
      id: 'seo-optimization',
      category: 'content',
      title: 'SEO Optimization',
      description: 'Verify SEO implementation and metadata',
      status: 'pending'
    }
  ]);

  const updateItemStatus = (id: string, status: ChecklistItem['status'], error?: string) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status, error, lastChecked: new Date() }
          : item
      )
    );

    // Update overall category status
    const categories = ['technical', 'application', 'content'];
    categories.forEach(category => {
      const categoryItems = checklistItems.filter(item => item.category === category);
      const allCompleted = categoryItems.every(item => item.status === 'completed');
      onStatusUpdate(`${category}Readiness`, allCompleted);
    });
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
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

  return (
    <div className="space-y-6">
      {['technical', 'application', 'content'].map(category => (
        <Card key={category} className="p-6">
          <Title className="capitalize mb-4">{category} Readiness</Title>
          <List>
            {checklistItems
              .filter(item => item.category === category)
              .map(item => (
                <ListItem key={item.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text className="font-medium">{item.title}</Text>
                      <Text className="text-gray-500">{item.description}</Text>
                      {item.error && (
                        <Text className="text-red-500 mt-1">{item.error}</Text>
                      )}
                      {item.lastChecked && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Last checked: {item.lastChecked.toLocaleString()}
                        </Text>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => updateItemStatus(item.id, 'in-progress')}
                      >
                        Check
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

export default PreLaunchChecklist; 