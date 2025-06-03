// Development-friendly Redis mock
class RedisMock {
  private store: Map<string, { value: string; expiry?: number }> = new Map();

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    const expiry = options?.ex ? Date.now() + (options.ex * 1000) : undefined;
    this.store.set(key, { value, expiry });
    
    // Clean up expired entries periodically
    this.cleanup();
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiry && now > item.expiry) {
        this.store.delete(key);
      }
    }
  }
}

export const redis = new RedisMock(); 