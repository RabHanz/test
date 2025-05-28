export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNodeData {
  label: string;
  config: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  position: Position;
  data: WorkflowNodeData;
}

export interface WorkflowTrigger {
  id: string;
  type: 'event' | 'schedule' | 'webhook' | 'api';
  config: {
    eventType?: string;
    schedule?: string;
    webhookUrl?: string;
    apiEndpoint?: string;
    conditions?: Record<string, any>;
  };
}

export interface WorkflowAction {
  id: string;
  type: 'email' | 'notification' | 'task' | 'webhook' | 'api' | 'integration';
  config: {
    template?: string;
    recipients?: string[];
    message?: string;
    webhookUrl?: string;
    apiEndpoint?: string;
    integrationType?: string;
    parameters?: Record<string, any>;
  };
}

export interface WorkflowCondition {
  id: string;
  type: 'if' | 'switch' | 'loop';
  config: {
    condition?: string;
    cases?: Record<string, any>[];
    loopType?: 'for' | 'while';
    loopConfig?: Record<string, any>;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  tags: string[];
  metadata: Record<string, any>;
} 