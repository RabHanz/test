import { BaseService } from '../BaseService';

class TestService extends BaseService {
  constructor() {
    super();
  }

  async testHandleError(error: unknown, context: string): Promise<never> {
    return this.handleError(error, context);
  }

  async testValidateResponse<T>(response: Response, context: string): Promise<T> {
    return this.validateResponse<T>(response, context);
  }

  async testFetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000
  ): Promise<Response> {
    return this.fetchWithTimeout(url, options, timeout);
  }
}

describe('BaseService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should log error and throw it', async () => {
      const error = new Error('Test error');
      const context = 'testContext';

      await expect(service.testHandleError(error, context)).rejects.toThrow('Test error');
      expect(console.error).toHaveBeenCalledWith('Error in testContext:', error);
    });
  });

  describe('validateResponse', () => {
    it('should return JSON data for successful response', async () => {
      const mockData = { test: 'data' };
      const response = new Response(JSON.stringify(mockData), { status: 200 });
      const context = 'testContext';

      const result = await service.testValidateResponse(response, context);
      expect(result).toEqual(mockData);
    });

    it('should throw error for unsuccessful response', async () => {
      const response = new Response('Error', { status: 404 });
      const context = 'testContext';

      await expect(service.testValidateResponse(response, context)).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });
  });

  describe('fetchWithTimeout', () => {
    it('should make successful fetch request', async () => {
      const mockResponse = new Response('Success', { status: 200 });
      global.fetch = jest.fn().mockResolvedValueOnce(mockResponse);

      const response = await service.testFetchWithTimeout('http://test.com');
      expect(response).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://test.com', {
        signal: expect.any(AbortSignal),
      });
    });

    it('should abort request after timeout', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => new Promise(() => {}));

      await expect(
        service.testFetchWithTimeout('http://test.com', {}, 100)
      ).rejects.toThrow('AbortError');
    });

    it('should clear timeout after successful request', async () => {
      const mockResponse = new Response('Success', { status: 200 });
      global.fetch = jest.fn().mockResolvedValueOnce(mockResponse);
      jest.spyOn(global, 'clearTimeout');

      await service.testFetchWithTimeout('http://test.com');
      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should clear timeout after failed request', async () => {
      const error = new Error('Network error');
      global.fetch = jest.fn().mockRejectedValueOnce(error);
      jest.spyOn(global, 'clearTimeout');

      await expect(service.testFetchWithTimeout('http://test.com')).rejects.toThrow('Network error');
      expect(clearTimeout).toHaveBeenCalled();
    });
  });
}); 