import React, { useState } from 'react';
import { Card, Title, Text, Button, Tabs, TabsList, TabsItem } from '@tremor/react';
import { FiPlus, FiList, FiSettings } from 'react-icons/fi';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import WorkflowMonitor from '@/components/workflow/WorkflowMonitor';
import WorkflowTemplates from '@/components/workflow/WorkflowTemplates';
import { Workflow } from '@/types/workflow';

const WorkflowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const handleSaveWorkflow = async (workflow: any) => {
    try {
      // Implement API call to save workflow
      console.log('Saving workflow:', workflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handlePauseWorkflow = async (workflowId: string) => {
    try {
      // Implement API call to pause workflow
      console.log('Pausing workflow:', workflowId);
    } catch (error) {
      console.error('Error pausing workflow:', error);
    }
  };

  const handleResumeWorkflow = async (workflowId: string) => {
    try {
      // Implement API call to resume workflow
      console.log('Resuming workflow:', workflowId);
    } catch (error) {
      console.error('Error resuming workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // Implement API call to delete workflow
      console.log('Deleting workflow:', workflowId);
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleUseTemplate = (template: any) => {
    setSelectedWorkflow(template.workflow);
    setActiveTab('builder');
  };

  const handleEditTemplate = (template: any) => {
    // Implement template editing logic
    console.log('Editing template:', template);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Implement API call to delete template
      console.log('Deleting template:', templateId);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title>Workflow Automation</Title>
            <Text>Create and manage automated workflows for your business</Text>
          </div>
          <Button icon={FiPlus} variant="primary">
            New Workflow
          </Button>
        </div>

        <Tabs defaultValue="builder" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsItem value="builder" icon={FiSettings}>
              Workflow Builder
            </TabsItem>
            <TabsItem value="monitor" icon={FiList}>
              Workflow Monitor
            </TabsItem>
            <TabsItem value="templates" icon={FiList}>
              Templates
            </TabsItem>
          </TabsList>
        </Tabs>
      </Card>

      {activeTab === 'builder' && (
        <WorkflowBuilder
          onSave={handleSaveWorkflow}
          initialWorkflow={selectedWorkflow}
        />
      )}

      {activeTab === 'monitor' && selectedWorkflow && (
        <WorkflowMonitor
          workflowId={selectedWorkflow.id}
          onPause={handlePauseWorkflow}
          onResume={handleResumeWorkflow}
          onDelete={handleDeleteWorkflow}
        />
      )}

      {activeTab === 'templates' && (
        <WorkflowTemplates
          onUseTemplate={handleUseTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}
    </div>
  );
};

export default WorkflowPage; 