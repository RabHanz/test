import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Title, Text, Badge, Button, Select, SelectItem } from '@tremor/react';
import { FiPlus, FiMoreVertical, FiFilter, FiSearch } from 'react-icons/fi';

interface PipelineStage {
  id: string;
  name: string;
  leads: Lead[];
  color: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  lastContact: Date;
  status: 'hot' | 'warm' | 'cold';
  source: string;
  notes: string[];
  tags: string[];
}

interface ServicePipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  metrics: {
    totalLeads: number;
    conversionRate: number;
    averageDealSize: number;
    averageCycleTime: number;
  };
}

const PipelineManagement: React.FC = () => {
  const [pipelines, setPipelines] = useState<ServicePipeline[]>([
    {
      id: 'ecommerce',
      name: 'E-commerce Launch',
      stages: [
        {
          id: 'discovery',
          name: 'Discovery',
          color: 'blue',
          leads: [
            {
              id: '1',
              name: 'John Doe',
              company: 'Tech Corp',
              email: 'john@techcorp.com',
              phone: '+1 234 567 890',
              value: 50000,
              lastContact: new Date('2024-03-01'),
              status: 'hot',
              source: 'Website',
              notes: ['Interested in full launch package'],
              tags: ['E-commerce', 'B2C']
            }
          ]
        },
        {
          id: 'qualification',
          name: 'Qualification',
          color: 'yellow',
          leads: []
        },
        {
          id: 'proposal',
          name: 'Proposal',
          color: 'orange',
          leads: []
        },
        {
          id: 'negotiation',
          name: 'Negotiation',
          color: 'red',
          leads: []
        },
        {
          id: 'closed',
          name: 'Closed Won',
          color: 'green',
          leads: []
        }
      ],
      metrics: {
        totalLeads: 1,
        conversionRate: 0,
        averageDealSize: 50000,
        averageCycleTime: 0
      }
    }
  ]);

  const [selectedPipeline, setSelectedPipeline] = useState<string>('ecommerce');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const pipeline = pipelines.find(p => p.id === selectedPipeline);
    if (!pipeline) return;

    const sourceStage = pipeline.stages.find(s => s.id === source.droppableId);
    const destStage = pipeline.stages.find(s => s.id === destination.droppableId);
    if (!sourceStage || !destStage) return;

    const [movedLead] = sourceStage.leads.splice(source.index, 1);
    destStage.leads.splice(destination.index, 0, movedLead);

    setPipelines([...pipelines]);
  };

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = {
      hot: { color: 'red', text: 'Hot' },
      warm: { color: 'yellow', text: 'Warm' },
      cold: { color: 'blue', text: 'Cold' }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm">
        {config.text}
      </Badge>
    );
  };

  const filteredLeads = (leads: Lead[]) => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Pipeline Management</Title>
        <div className="flex items-center gap-4">
          <Select
            value={selectedPipeline}
            onValueChange={setSelectedPipeline}
            className="w-48"
          >
            {pipelines.map(pipeline => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </Select>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="w-32"
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </Select>
          <Button size="xs" variant="secondary" icon={FiPlus}>
            Add Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {pipelines
          .find(p => p.id === selectedPipeline)
          ?.stages.map(stage => (
            <Card key={stage.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Text className="font-medium">{stage.name}</Text>
                  <Text className="text-sm text-gray-500">
                    {filteredLeads(stage.leads).length} leads
                  </Text>
                </div>
                <Button size="xs" variant="secondary" icon={FiMoreVertical} />
              </div>
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 min-h-[200px]"
                  >
                    {filteredLeads(stage.leads).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Text className="font-medium">{lead.name}</Text>
                              {getStatusBadge(lead.status)}
                            </div>
                            <Text className="text-sm text-gray-500">
                              {lead.company}
                            </Text>
                            <div className="mt-2 flex items-center justify-between">
                              <Text className="text-sm">
                                ${lead.value.toLocaleString()}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {lead.lastContact.toLocaleDateString()}
                              </Text>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          ))}
      </div>

      <Card className="p-6">
        <Title>Pipeline Metrics</Title>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Object.entries(
            pipelines.find(p => p.id === selectedPipeline)?.metrics || {}
          ).map(([key, value]) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-500">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <Text className="text-2xl font-semibold mt-1">
                {typeof value === 'number' && key !== 'conversionRate'
                  ? value.toLocaleString()
                  : `${value}%`}
              </Text>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PipelineManagement; 