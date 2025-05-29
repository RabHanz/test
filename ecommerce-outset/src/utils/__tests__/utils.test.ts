import { CircuitBreaker, withCircuitBreaker } from '../circuitBreaker';
import { Pagination, usePagination } from '../pagination';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      monitorInterval: 100,
    });
  });

  afterEach(() => {
    circuitBreaker.destroy();
  });

  it('should execute successful function calls', async () => {
    const successFn = async () => 'success';
    const result = await circuitBreaker.execute(successFn);
    expect(result).toBe('success');
    expect(circuitBreaker.getState().failures).toBe(0);
  });

  it('should track failures and open circuit after threshold', async () => {
    const failFn = async () => {
      throw new Error('test error');
    };

    for (let i = 0; i < 3; i++) {
      await expect(circuitBreaker.execute(failFn)).rejects.toThrow('test error');
    }

    expect(circuitBreaker.getState().isOpen).toBe(true);
    await expect(circuitBreaker.execute(failFn)).rejects.toThrow('Circuit breaker is open');
  });

  it('should reset after timeout', async () => {
    const failFn = async () => {
      throw new Error('test error');
    };

    for (let i = 0; i < 3; i++) {
      await expect(circuitBreaker.execute(failFn)).rejects.toThrow('test error');
    }

    expect(circuitBreaker.getState().isOpen).toBe(true);

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    const successFn = async () => 'success';
    const result = await circuitBreaker.execute(successFn);
    expect(result).toBe('success');
  });

  it('should work with higher-order function', async () => {
    const successFn = async () => 'success';
    const result = await withCircuitBreaker(successFn);
    expect(result).toBe('success');
  });
});

describe('Pagination', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
  const pageSize = 10;

  it('should initialize with correct state', () => {
    const pagination = new Pagination(items, { pageSize });
    const state = pagination.getState();

    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(10);
    expect(state.totalItems).toBe(100);
    expect(state.items.length).toBe(pageSize);
    expect(state.hasNextPage).toBe(true);
    expect(state.hasPreviousPage).toBe(false);
  });

  it('should navigate through pages', () => {
    const pagination = new Pagination(items, { pageSize });

    expect(pagination.nextPage()).toBe(true);
    expect(pagination.getCurrentPage()).toBe(2);
    expect(pagination.getCurrentPageItems()[0].id).toBe(11);

    expect(pagination.previousPage()).toBe(true);
    expect(pagination.getCurrentPage()).toBe(1);
    expect(pagination.getCurrentPageItems()[0].id).toBe(1);
  });

  it('should handle page boundaries', () => {
    const pagination = new Pagination(items, { pageSize });

    expect(pagination.previousPage()).toBe(false);
    expect(pagination.getCurrentPage()).toBe(1);

    for (let i = 0; i < 10; i++) {
      pagination.nextPage();
    }

    expect(pagination.nextPage()).toBe(false);
    expect(pagination.getCurrentPage()).toBe(10);
  });

  it('should go to specific page', () => {
    const pagination = new Pagination(items, { pageSize });

    expect(pagination.goToPage(5)).toBe(true);
    expect(pagination.getCurrentPage()).toBe(5);
    expect(pagination.getCurrentPageItems()[0].id).toBe(41);

    expect(pagination.goToPage(0)).toBe(false);
    expect(pagination.goToPage(11)).toBe(false);
  });

  it('should work with usePagination hook', () => {
    const {
      currentItems,
      currentPage,
      totalPages,
      totalItems,
      hasNextPage,
      hasPreviousPage,
      nextPage,
      previousPage,
      goToPage,
    } = usePagination(items, { pageSize });

    expect(currentPage).toBe(1);
    expect(totalPages).toBe(10);
    expect(totalItems).toBe(100);
    expect(currentItems.length).toBe(pageSize);
    expect(hasNextPage).toBe(true);
    expect(hasPreviousPage).toBe(false);

    nextPage();
    expect(currentPage).toBe(2);

    goToPage(5);
    expect(currentPage).toBe(5);

    previousPage();
    expect(currentPage).toBe(4);
  });
}); 