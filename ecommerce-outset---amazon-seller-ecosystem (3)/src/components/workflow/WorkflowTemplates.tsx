import React, { useState } from 'react';
import { Card, Title, Text, Button, Grid, Col, Badge } from '@tremor/react';
import { FiPlus, FiEdit2, FiCopy, FiTrash2 } from 'react-icons/fi';
import { Workflow } from '@/types/workflow';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  workflow: Workflow;
}

interface WorkflowTemplatesProps {
  onUseTemplate: (template: WorkflowTemplate) => void;
  onEditTemplate: (template: WorkflowTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  onUseTemplate,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock templates data
  const templates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'New Customer Onboarding',
      description: 'Automated workflow for welcoming and onboarding new customers',
      category: 'customer-success',
      tags: ['onboarding', 'automation', 'welcome'],
      workflow: {
        id: '1',
        name: 'New Customer Onboarding',
        description: 'Automated workflow for welcoming and onboarding new customers',
        nodes: [],
        triggers: [],
        actions: [],
        conditions: [],
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        version: 1,
        tags: ['onboarding', 'automation', 'welcome'],
        metadata: {},
      },
    },
    {
      id: '2',
      name: 'Lead Nurturing Sequence',
      description: 'Automated email sequence for nurturing leads',
      category: 'marketing',
      tags: ['email', 'nurturing', 'leads'],
      workflow: {
        id: '2',
        name: 'Lead Nurturing Sequence',
        description: 'Automated email sequence for nurturing leads',
        nodes: [],
        triggers: [],
        actions: [],
        conditions: [],
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
        version: 1,
        tags: ['email', 'nurturing', 'leads'],
        metadata: {},
      },
    },
    // Add more templates as needed
  ];

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'customer-success', name: 'Customer Success' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'support', name: 'Support' },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title>Workflow Templates</Title>
          <Button icon={FiPlus} variant="primary">
            Create Template
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
          {filteredTemplates.map((template) => (
            <Col key={template.id}>
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title>{template.name}</Title>
                    <Text>{template.description}</Text>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      icon={FiEdit2}
                      variant="secondary"
                      size="xs"
                      onClick={() => onEditTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button
                      icon={FiCopy}
                      variant="secondary"
                      size="xs"
                      onClick={() => onUseTemplate(template)}
                    >
                      Use
                    </Button>
                    <Button
                      icon={FiTrash2}
                      variant="secondary"
                      size="xs"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} color="blue">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Grid>
      </Card>
    </div>
  );
};

export default WorkflowTemplates; 