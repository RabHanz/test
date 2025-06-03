export abstract class BaseService {
  public constructor() {
    // Initialize base service
  }

  protected async handleError(error: unknown, context: string): Promise<never> {
    console.error(`Error in ${context}:`, error);
    throw error;
  }

  protected async validateResponse<T>(response: Response, context: string): Promise<T> {
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      return this.handleError(error, context);
    }
    return response.json();
  }

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
}