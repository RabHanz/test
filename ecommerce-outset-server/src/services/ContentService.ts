import { BaseService } from './BaseService';
import { ContentVersion, ContentMetadata } from './contentGovernance';

export class ContentService extends BaseService<ContentVersion> {
  constructor() {
    super('/content');
  }

  async getContentByCategory(category: string): Promise<ContentVersion[]> {
    try {
      const response = await this.axios.get(`${this.baseUrl}/category/${category}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getContentByTags(tags: string[]): Promise<ContentVersion[]> {
    try {
      const response = await this.axios.get(`${this.baseUrl}/tags`, {
        params: { tags: tags.join(',') },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getContentByAudience(audience: string[]): Promise<ContentVersion[]> {
    try {
      const response = await this.axios.get(`${this.baseUrl}/audience`, {
        params: { audience: audience.join(',') },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createContentWithMetadata(
    content: string,
    metadata: ContentMetadata
  ): Promise<ContentVersion> {
    try {
      const response = await this.axios.post(`${this.baseUrl}/with-metadata`, {
        content,
        metadata,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateContentMetadata(
    id: string,
    metadata: Partial<ContentMetadata>
  ): Promise<ContentVersion> {
    try {
      const response = await this.axios.patch(`${this.baseUrl}/${id}/metadata`, metadata);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getContentHistory(id: string): Promise<ContentVersion[]> {
    try {
      const response = await this.axios.get(`${this.baseUrl}/${id}/history`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitForReview(id: string): Promise<ContentVersion> {
    try {
      const response = await this.axios.post(`${this.baseUrl}/${id}/review`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async approveContent(id: string, comment?: string): Promise<ContentVersion> {
    try {
      const response = await this.axios.post(`${this.baseUrl}/${id}/approve`, { comment });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async rejectContent(id: string, reason: string): Promise<ContentVersion> {
    try {
      const response = await this.axios.post(`${this.baseUrl}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addComment(
    id: string,
    text: string,
    type: 'feedback' | 'approval' | 'rejection'
  ): Promise<ContentVersion> {
    try {
      const response = await this.axios.post(`${this.baseUrl}/${id}/comment`, {
        text,
        type,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
} 