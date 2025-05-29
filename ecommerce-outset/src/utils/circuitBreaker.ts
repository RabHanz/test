interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval: number;
}

interface CircuitState {
  failures: number;
  lastFailureTime: number | null;
  isOpen: boolean;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  monitorInterval: 1000, // 1 second
};

export class CircuitBreaker {
  private state: CircuitState = {
    failures: 0,
    lastFailureTime: null,
    isOpen: false,
  };

  private options: CircuitBreakerOptions;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.monitorInterval = setInterval(() => {
      this.checkCircuit();
    }, this.options.monitorInterval);
  }

  private checkCircuit(): void {
    if (!this.state.isOpen || !this.state.lastFailureTime) return;

    const now = Date.now();
    if (now - this.state.lastFailureTime >= this.options.resetTimeout) {
      this.reset();
    }
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.isOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.failures = 0;
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failures >= this.options.failureThreshold) {
      this.state.isOpen = true;
    }
  }

  private reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: null,
      isOpen: false,
    };
  }

  public getState(): CircuitState {
    return { ...this.state };
  }

  public destroy(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

// Higher-order function to wrap API calls with circuit breaker
export const withCircuitBreaker = <T>(
  fn: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> => {
  const circuitBreaker = new CircuitBreaker(options);
  return circuitBreaker.execute(fn);
}; 