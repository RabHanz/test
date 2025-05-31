import { monitoringService } from './monitoringService';

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueueSize: number;
}

interface WebSocketMessage {
  type: string;
  payload: any;
  priority?: 'high' | 'normal' | 'low';
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts: number = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnecting: boolean = false;
  private messageQueue: WebSocketMessage[] = [];
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  private lastMessageTimestamp: number = 0;
  private readonly MESSAGE_THROTTLE = 100; // Minimum time between messages in ms

  private constructor(config: WebSocketConfig) {
    this.config = config;
  }

  public static getInstance(config: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(config);
    }
    return WebSocketManager.instance;
  }

  public connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;

    this.isConnecting = true;
    this.connectionStatus = 'connecting';
    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      monitoringService.trackUserExperience({
        type: 'interaction',
        name: 'websocket_connected',
        success: true,
        context: { reconnectAttempts: this.reconnectAttempts }
      });
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.connectionStatus = 'disconnected';
      this.stopHeartbeat();
      this.handleReconnect();
      monitoringService.trackUserExperience({
        type: 'interaction',
        name: 'websocket_disconnected',
        success: false,
        context: { reconnectAttempts: this.reconnectAttempts }
      });
    };

    this.ws.onerror = (event) => {
      this.isConnecting = false;
      this.connectionStatus = 'disconnected';
      monitoringService.trackError(new Error('WebSocket error'), { 
        context: 'websocket_error',
        event: event
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        monitoringService.trackError(error as Error, {
          context: 'websocket_message_parse_error',
          data: event.data,
        });
      }
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      monitoringService.trackError(new Error('Max reconnection attempts reached'), {
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ 
          type: 'heartbeat', 
          payload: { timestamp: Date.now() },
          priority: 'low'
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public subscribe(type: string, handler: (data: any) => void): () => void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);

    return () => {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        this.messageHandlers.set(type, handlers);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.payload);
      } catch (error) {
        monitoringService.trackError(error as Error, {
          context: 'websocket_message_handler_error',
          messageType: message.type,
        });
      }
    });
  }

  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const now = Date.now();
      if (now - this.lastMessageTimestamp < this.MESSAGE_THROTTLE) {
        this.queueMessage(message);
        return;
      }
      
      this.ws.send(JSON.stringify(message));
      this.lastMessageTimestamp = now;
    } else {
      this.queueMessage(message);
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      // Remove lowest priority message if queue is full
      const lowestPriorityIndex = this.messageQueue.findIndex(
        m => m.priority === 'low'
      );
      if (lowestPriorityIndex !== -1) {
        this.messageQueue.splice(lowestPriorityIndex, 1);
      }
    }
    this.messageQueue.push(message);
  }

  private flushMessageQueue(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    // Sort messages by priority
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
    });

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.connectionStatus = 'disconnected';
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }
}

export const websocketManager = WebSocketManager.getInstance({
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  messageQueueSize: 100,
}); 