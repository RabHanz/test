import React, { useState, useCallback } from 'react';
import { Card, Title, Text, Button, Grid, Col } from '@tremor/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiTrash2, FiSettings, FiPlay, FiPause } from 'react-icons/fi';
import { WorkflowNode, WorkflowTrigger, WorkflowAction, WorkflowCondition } from '@/types/workflow';

interface WorkflowBuilderProps {
  onSave: (workflow: any) => void;
  initialWorkflow?: any;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, initialWorkflow }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialWorkflow?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const items = Array.from(nodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setNodes(items);
  }, [nodes]);

  const addNode = useCallback((type: 'trigger' | 'action' | 'condition') => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 0, y: 0 },
      data: {
        label: `New ${type}`,
        config: {}
      }
    };
    setNodes([...nodes, newNode]);
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  }, [nodes]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, [nodes]);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <Title>Workflow Builder</Title>
          <div className="flex gap-2">
            <Button
              icon={FiPlay}
              variant="secondary"
              onClick={() => onSave({ nodes })}
            >
              Save Workflow
            </Button>
            <Button
              icon={FiSettings}
              variant="secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Node Palette */}
          <Col numColSpan={3}>
            <Card>
              <Title>Nodes</Title>
              <div className="space-y-2 mt-4">
                <Button
                  icon={FiPlus}
                  variant="secondary"
                  onClick={() => addNode('trigger')}
                  className="w-full"
                >
                  Add Trigger
                </Button>
                <Button
                  icon={FiPlus}
                  variant="secondary"
                  onClick={() => addNode('action')}
                  className="w-full"
                >
                  Add Action
                </Button>
                <Button
                  icon={FiPlus}
                  variant="secondary"
                  onClick={() => addNode('condition')}
                  className="w-full"
                >
                  Add Condition
                </Button>
              </div>
            </Card>
          </Col>

          {/* Workflow Canvas */}
          <Col numColSpan={9}>
            <Card className="min-h-[600px]">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="workflow">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {nodes.map((node, index) => (
                        <Draggable
                          key={node.id}
                          draggableId={node.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                            >
                              <div className="flex justify-between items-center">
                                <Text>{node.data.label}</Text>
                                <div className="flex gap-2">
                                  <Button
                                    icon={FiSettings}
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => setSelectedNode(node)}
                                  >
                                    Configure
                                  </Button>
                                  <Button
                                    icon={FiTrash2}
                                    variant="secondary"
                                    size="xs"
                                    onClick={() => deleteNode(node.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>
          </Col>
        </div>
      </Card>

      {/* Node Configuration Modal */}
      {selectedNode && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <Title>Configure Node</Title>
            {/* Add node configuration form here */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedNode(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save node configuration
                  setSelectedNode(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkflowBuilder; 