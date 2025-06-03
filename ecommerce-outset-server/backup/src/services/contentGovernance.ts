import { v4 as uuidv4 } from 'uuid';

export interface ContentVersion {
  id: string;
  version: number;
  content: string;
  author: string;
  timestamp: Date;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  comments: Comment[];
  metadata: ContentMetadata;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  type: 'feedback' | 'approval' | 'rejection';
}

export interface ContentMetadata {
  title: string;
  category: string;
  tags: string[];
  lastModified: Date;
  created: Date;
  contentType: 'article' | 'template' | 'guide' | 'video';
  targetAudience: string[];
  seoKeywords: string[];
}

class ContentGovernanceService {
  private static instance: ContentGovernanceService;
  private contentVersions: Map<string, ContentVersion[]>;

  private constructor() {
    this.contentVersions = new Map();
  }

  public static getInstance(): ContentGovernanceService {
    if (!ContentGovernanceService.instance) {
      ContentGovernanceService.instance = new ContentGovernanceService();
    }
    return ContentGovernanceService.instance;
  }

  public createContent(
    content: string,
    author: string,
    metadata: ContentMetadata
  ): ContentVersion {
    const version: ContentVersion = {
      id: uuidv4(),
      version: 1,
      content,
      author,
      timestamp: new Date(),
      status: 'draft',
      comments: [],
      metadata,
    };

    this.contentVersions.set(version.id, [version]);
    return version;
  }

  public updateContent(
    contentId: string,
    content: string,
    author: string
  ): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    if (!versions) return null;

    const currentVersion = versions[0];
    if (currentVersion.status !== 'draft') {
      throw new Error('Can only update content in draft status');
    }

    const newVersion: ContentVersion = {
      ...currentVersion,
      id: uuidv4(),
      version: currentVersion.version + 1,
      content,
      author,
      timestamp: new Date(),
      metadata: {
        ...currentVersion.metadata,
        lastModified: new Date(),
      },
    };

    versions.unshift(newVersion);
    return newVersion;
  }

  public submitForReview(contentId: string): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    if (!versions) return null;

    const currentVersion = versions[0];
    if (currentVersion.status !== 'draft') {
      throw new Error('Can only submit draft content for review');
    }

    const newVersion: ContentVersion = {
      ...currentVersion,
      id: uuidv4(),
      version: currentVersion.version + 1,
      status: 'review',
      timestamp: new Date(),
    };

    versions.unshift(newVersion);
    return newVersion;
  }

  public approveContent(
    contentId: string,
    approver: string,
    comment?: string
  ): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    if (!versions) return null;

    const currentVersion = versions[0];
    if (currentVersion.status !== 'review') {
      throw new Error('Can only approve content in review status');
    }

    const newVersion: ContentVersion = {
      ...currentVersion,
      id: uuidv4(),
      version: currentVersion.version + 1,
      status: 'approved',
      timestamp: new Date(),
      comments: [
        ...currentVersion.comments,
        {
          id: uuidv4(),
          author: approver,
          text: comment || 'Content approved',
          timestamp: new Date(),
          type: 'approval',
        },
      ],
    };

    versions.unshift(newVersion);
    return newVersion;
  }

  public rejectContent(
    contentId: string,
    rejector: string,
    reason: string
  ): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    if (!versions) return null;

    const currentVersion = versions[0];
    if (currentVersion.status !== 'review') {
      throw new Error('Can only reject content in review status');
    }

    const newVersion: ContentVersion = {
      ...currentVersion,
      id: uuidv4(),
      version: currentVersion.version + 1,
      status: 'rejected',
      timestamp: new Date(),
      comments: [
        ...currentVersion.comments,
        {
          id: uuidv4(),
          author: rejector,
          text: reason,
          timestamp: new Date(),
          type: 'rejection',
        },
      ],
    };

    versions.unshift(newVersion);
    return newVersion;
  }

  public addComment(
    contentId: string,
    author: string,
    text: string,
    type: 'feedback' | 'approval' | 'rejection' = 'feedback'
  ): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    if (!versions) return null;

    const currentVersion = versions[0];
    const newVersion: ContentVersion = {
      ...currentVersion,
      id: uuidv4(),
      version: currentVersion.version + 1,
      timestamp: new Date(),
      comments: [
        ...currentVersion.comments,
        {
          id: uuidv4(),
          author,
          text,
          timestamp: new Date(),
          type,
        },
      ],
    };

    versions.unshift(newVersion);
    return newVersion;
  }

  public getContentVersions(contentId: string): ContentVersion[] | null {
    return this.contentVersions.get(contentId) || null;
  }

  public getLatestVersion(contentId: string): ContentVersion | null {
    const versions = this.contentVersions.get(contentId);
    return versions ? versions[0] : null;
  }

  public getContentHistory(contentId: string): ContentVersion[] | null {
    const versions = this.contentVersions.get(contentId);
    return versions ? [...versions] : null;
  }
}

export const contentGovernanceService = ContentGovernanceService.getInstance(); 