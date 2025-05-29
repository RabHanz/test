import { useState, useCallback } from 'react';
import {
  contentGovernanceService,
  ContentVersion,
  ContentMetadata,
} from '../services/contentGovernance';

interface UseContentGovernanceProps {
  contentId?: string;
  initialContent?: string;
  initialMetadata?: ContentMetadata;
}

interface UseContentGovernanceReturn {
  currentVersion: ContentVersion | null;
  versions: ContentVersion[] | null;
  isDraft: boolean;
  isReview: boolean;
  isApproved: boolean;
  isRejected: boolean;
  createContent: (content: string, metadata: ContentMetadata) => void;
  updateContent: (content: string) => void;
  submitForReview: () => void;
  approveContent: (comment?: string) => void;
  rejectContent: (reason: string) => void;
  addComment: (text: string, type?: 'feedback' | 'approval' | 'rejection') => void;
  getContentHistory: () => ContentVersion[] | null;
}

export const useContentGovernance = ({
  contentId,
  initialContent,
  initialMetadata,
}: UseContentGovernanceProps = {}): UseContentGovernanceReturn => {
  const [currentVersion, setCurrentVersion] = useState<ContentVersion | null>(
    contentId ? contentGovernanceService.getLatestVersion(contentId) : null
  );
  const [versions, setVersions] = useState<ContentVersion[] | null>(
    contentId ? contentGovernanceService.getContentVersions(contentId) : null
  );

  const createContent = useCallback(
    (content: string, metadata: ContentMetadata) => {
      const newVersion = contentGovernanceService.createContent(
        content,
        'Current User', // TODO: Get from auth context
        metadata
      );
      setCurrentVersion(newVersion);
      setVersions([newVersion]);
    },
    []
  );

  const updateContent = useCallback(
    (content: string) => {
      if (!currentVersion) return;

      const newVersion = contentGovernanceService.updateContent(
        currentVersion.id,
        content,
        'Current User' // TODO: Get from auth context
      );

      if (newVersion) {
        setCurrentVersion(newVersion);
        setVersions((prev) => (prev ? [newVersion, ...prev] : [newVersion]));
      }
    },
    [currentVersion]
  );

  const submitForReview = useCallback(() => {
    if (!currentVersion) return;

    const newVersion = contentGovernanceService.submitForReview(currentVersion.id);
    if (newVersion) {
      setCurrentVersion(newVersion);
      setVersions((prev) => (prev ? [newVersion, ...prev] : [newVersion]));
    }
  }, [currentVersion]);

  const approveContent = useCallback(
    (comment?: string) => {
      if (!currentVersion) return;

      const newVersion = contentGovernanceService.approveContent(
        currentVersion.id,
        'Current User', // TODO: Get from auth context
        comment
      );

      if (newVersion) {
        setCurrentVersion(newVersion);
        setVersions((prev) => (prev ? [newVersion, ...prev] : [newVersion]));
      }
    },
    [currentVersion]
  );

  const rejectContent = useCallback(
    (reason: string) => {
      if (!currentVersion) return;

      const newVersion = contentGovernanceService.rejectContent(
        currentVersion.id,
        'Current User', // TODO: Get from auth context
        reason
      );

      if (newVersion) {
        setCurrentVersion(newVersion);
        setVersions((prev) => (prev ? [newVersion, ...prev] : [newVersion]));
      }
    },
    [currentVersion]
  );

  const addComment = useCallback(
    (text: string, type: 'feedback' | 'approval' | 'rejection' = 'feedback') => {
      if (!currentVersion) return;

      const newVersion = contentGovernanceService.addComment(
        currentVersion.id,
        'Current User', // TODO: Get from auth context
        text,
        type
      );

      if (newVersion) {
        setCurrentVersion(newVersion);
        setVersions((prev) => (prev ? [newVersion, ...prev] : [newVersion]));
      }
    },
    [currentVersion]
  );

  const getContentHistory = useCallback(() => {
    if (!currentVersion) return null;
    return contentGovernanceService.getContentHistory(currentVersion.id);
  }, [currentVersion]);

  return {
    currentVersion,
    versions,
    isDraft: currentVersion?.status === 'draft',
    isReview: currentVersion?.status === 'review',
    isApproved: currentVersion?.status === 'approved',
    isRejected: currentVersion?.status === 'rejected',
    createContent,
    updateContent,
    submitForReview,
    approveContent,
    rejectContent,
    addComment,
    getContentHistory,
  };
}; 