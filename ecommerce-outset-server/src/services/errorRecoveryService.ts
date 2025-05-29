import { monitoringService } from './monitoringService';

export interface ErrorContext {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'authorization' | 'system' | 'unknown';
  recoverable: boolean;
  timestamp: number;
  context: Record<string, any>;
}

export interface RecoveryAction {
  type: 'retry' | 'redirect' | 'refresh' | 'clear_cache' | 'logout' | 'custom';
  label: string;
  handler: () => Promise<void>;
  priority: number;
}

class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private errorHistory: ErrorContext[] = [];
  private readonly MAX_HISTORY_SIZE = 100;
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();

  private constructor() {
    this.initializeDefaultRecoveryActions();
  }

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  private initializeDefaultRecoveryActions(): void {
    // Network errors
    this.registerRecoveryActions('network', [
      {
        type: 'retry',
        label: 'Try Again',
        handler: async () => {
          await this.retryLastOperation();
        },
        priority: 1
      },
      {
        type: 'refresh',
        label: 'Refresh Page',
        handler: async () => {
          window.location.reload();
        },
        priority: 2
      }
    ]);

    // Authentication errors
    this.registerRecoveryActions('authentication', [
      {
        type: 'logout',
        label: 'Log Out',
        handler: async () => {
          // Implement logout logic
          window.location.href = '/login';
        },
        priority: 1
      },
      {
        type: 'redirect',
        label: 'Go to Login',
        handler: async () => {
          window.location.href = '/login';
        },
        priority: 2
      }
    ]);

    // System errors
    this.registerRecoveryActions('system', [
      {
        type: 'clear_cache',
        label: 'Clear Cache',
        handler: async () => {
          await this.clearApplicationCache();
        },
        priority: 1
      },
      {
        type: 'refresh',
        label: 'Refresh Application',
        handler: async () => {
          window.location.reload();
        },
        priority: 2
      }
    ]);
  }

  public registerRecoveryActions(errorCategory: string, actions: RecoveryAction[]): void {
    this.recoveryActions.set(errorCategory, actions);
  }

  public async handleError(error: Error, context: Partial<ErrorContext>): Promise<ErrorContext> {
    const errorContext: ErrorContext = {
      code: context.code || 'UNKNOWN_ERROR',
      message: error.message,
      severity: context.severity || 'medium',
      category: context.category || 'unknown',
      recoverable: context.recoverable ?? true,
      timestamp: Date.now(),
      context: context.context || {}
    };

    this.errorHistory.push(errorContext);
    if (this.errorHistory.length > this.MAX_HISTORY_SIZE) {
      this.errorHistory.shift();
    }

    monitoringService.trackError(error, {
      context: 'error_recovery',
      errorContext
    });

    if (errorContext.recoverable) {
      await this.attemptRecovery(errorContext);
    }

    return errorContext;
  }

  private async attemptRecovery(errorContext: ErrorContext): Promise<void> {
    const actions = this.recoveryActions.get(errorContext.category) || [];
    const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

    for (const action of sortedActions) {
      try {
        await action.handler();
        monitoringService.trackUserExperience({
          type: 'interaction',
          name: 'error_recovery_success',
          success: true,
          context: {
            errorCode: errorContext.code,
            recoveryAction: action.type
          }
        });
        return;
      } catch (recoveryError) {
        monitoringService.trackError(recoveryError as Error, {
          context: 'error_recovery',
          action: action.type,
          originalError: errorContext
        });
      }
    }
  }

  private async retryLastOperation(): Promise<void> {
    // Implement retry logic for the last failed operation
    const lastError = this.errorHistory[this.errorHistory.length - 1];
    if (lastError) {
      // Implement retry mechanism based on error context
      monitoringService.trackUserExperience({
        type: 'interaction',
        name: 'operation_retry',
        context: {
          errorCode: lastError.code,
          retryCount: 1
        }
      });
    }
  }

  private async clearApplicationCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      localStorage.clear();
      sessionStorage.clear();
      
      monitoringService.trackUserExperience({
        type: 'interaction',
        name: 'cache_cleared',
        success: true
      });
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'error_recovery',
        action: 'clear_cache'
      });
    }
  }

  public getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  public getRecoveryActions(errorCategory: string): RecoveryAction[] {
    return this.recoveryActions.get(errorCategory) || [];
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }
}

export const errorRecoveryService = ErrorRecoveryService.getInstance(); 