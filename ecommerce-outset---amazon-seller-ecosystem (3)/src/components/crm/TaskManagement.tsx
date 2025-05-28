import React, { useState } from 'react';
import { Card, Title, Text, Badge, Button, List, ListItem, Select, SelectItem } from '@tremor/react';
import { FiPlus, FiCheck, FiClock, FiUser, FiCalendar, FiTag } from 'react-icons/fi';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  tags: string[];
  relatedTo?: {
    type: 'lead' | 'deal' | 'contact';
    id: string;
    name: string;
  };
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Follow up with John Doe',
      description: 'Schedule a call to discuss the proposal',
      status: 'todo',
      priority: 'high',
      assignee: 'Sarah Smith',
      dueDate: '2024-03-20',
      tags: ['follow-up', 'sales'],
      relatedTo: {
        type: 'lead',
        id: 'lead-1',
        name: 'John Doe'
      }
    }
  ]);

  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });

  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = {
      todo: { color: 'gray', icon: <FiClock className="w-4 h-4" /> },
      in_progress: { color: 'yellow', icon: <FiClock className="w-4 h-4" /> },
      completed: { color: 'green', icon: <FiCheck className="w-4 h-4" /> }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm" className="flex items-center gap-1">
        {config.icon}
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const priorityConfig = {
      high: { color: 'red' },
      medium: { color: 'yellow' },
      low: { color: 'blue' }
    };

    const config = priorityConfig[priority];
    return (
      <Badge color={config.color as any} size="sm">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
    if (filter.assignee !== 'all' && task.assignee !== filter.assignee) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>Task Management</Title>
        <Button size="xs" variant="secondary" icon={FiPlus}>
          Create Task
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <Select
            value={filter.status}
            onValueChange={value => setFilter(prev => ({ ...prev, status: value }))}
          >
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </Select>

          <Select
            value={filter.priority}
            onValueChange={value => setFilter(prev => ({ ...prev, priority: value }))}
          >
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </Select>

          <Select
            value={filter.assignee}
            onValueChange={value => setFilter(prev => ({ ...prev, assignee: value }))}
          >
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="Sarah Smith">Sarah Smith</SelectItem>
            <SelectItem value="John Doe">John Doe</SelectItem>
          </Select>
        </div>
      </Card>

      <List>
        {filteredTasks.map(task => (
          <ListItem key={task.id} className="py-4">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Title>{task.title}</Title>
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                  <Text className="text-gray-500">{task.description}</Text>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      {task.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    {task.relatedTo && (
                      <div className="flex items-center gap-1">
                        <FiTag className="w-4 h-4" />
                        {task.relatedTo.type}: {task.relatedTo.name}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {task.tags.map(tag => (
                      <Badge key={tag} color="gray" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="xs" variant="secondary">
                    Edit
                  </Button>
                  <Button size="xs" variant="secondary">
                    Complete
                  </Button>
                </div>
              </div>
            </Card>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TaskManagement; 