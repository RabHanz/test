import axios from 'axios';
import { axe, AxeResults } from 'axe-core';
import {
  JourneyMetrics,
  ABTest,
  PerformanceMetrics,
  UserFeedback,
  AccessibilityReport,
  ErrorReport,
  ConversionTest,
  PersonaType,
  JourneyStage
} from '../types/testing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Journey Tracking
export const trackJourneyStage = async (
  personaType: PersonaType,
  stage: JourneyStage,
  action: 'START' | 'COMPLETE'
): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/testing/journey/track`, {
      personaType,
      stage,
      action,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error tracking journey stage:', error);
  }
};

export const getJourneyMetrics = async (personaType?: PersonaType): Promise<JourneyMetrics[]> => {
  const response = await axios.get(`${API_BASE_URL}/testing/journey/metrics`, {
    params: { personaType }
  });
  return response.data;
};

// A/B Testing
export const getActiveTests = async (): Promise<ABTest[]> => {
  const response = await axios.get(`${API_BASE_URL}/testing/ab-tests`);
  return response.data;
};

export const trackTestImpression = async (testId: string, variantId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/testing/ab-tests/${testId}/impression`, { variantId });
};

export const trackTestConversion = async (testId: string, variantId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/testing/ab-tests/${testId}/conversion`, { variantId });
};

// Performance Monitoring
export const trackPerformanceMetrics = async (metrics: Omit<PerformanceMetrics, 'timestamp'>): Promise<void> => {
  await axios.post(`${API_BASE_URL}/testing/performance`, {
    ...metrics,
    timestamp: new Date()
  });
};

// User Feedback
export const submitFeedback = async (feedback: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<UserFeedback> => {
  const response = await axios.post(`${API_BASE_URL}/testing/feedback`, feedback);
  return response.data;
};

// Accessibility Testing
export const runAccessibilityCheck = async (): Promise<AccessibilityReport> => {
  const results = await axe.run();
  const report: AccessibilityReport = {
    id: crypto.randomUUID(),
    pageUrl: window.location.href,
    wcagScore: calculateWCAGScore(results),
    violations: results.violations.map(v => ({
      id: v.id,
      impact: v.impact as 'MINOR' | 'MODERATE' | 'SERIOUS' | 'CRITICAL',
      description: v.description,
      help: v.help,
      nodes: v.nodes.map(n => n.html)
    })),
    passes: results.passes.map(p => ({
      id: p.id,
      impact: p.impact as 'MINOR' | 'MODERATE' | 'SERIOUS' | 'CRITICAL',
      description: p.description,
      nodes: p.nodes.map(n => n.html)
    })),
    timestamp: new Date()
  };

  await axios.post(`${API_BASE_URL}/testing/accessibility`, report);
  return report;
};

// Error Tracking
export const reportError = async (error: Error, context: Partial<ErrorReport>): Promise<ErrorReport> => {
  const errorReport: ErrorReport = {
    id: crypto.randomUUID(),
    type: 'JAVASCRIPT',
    message: error.message,
    stack: error.stack,
    userInfo: {
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      deviceInfo: getDeviceInfo(),
      ...context.userInfo
    },
    impact: {
      affectedUsers: 1,
      frequency: 1,
      severity: 'LOW',
      ...context.impact
    },
    status: 'NEW',
    createdAt: new Date()
  };

  const response = await axios.post(`${API_BASE_URL}/testing/errors`, errorReport);
  return response.data;
};

// Conversion Testing
export const getActiveConversionTests = async (): Promise<ConversionTest[]> => {
  const response = await axios.get(`${API_BASE_URL}/testing/conversion-tests`);
  return response.data;
};

export const trackConversionTestImpression = async (testId: string, variantId: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/testing/conversion-tests/${testId}/impression`, { variantId });
};

export const trackConversionTestConversion = async (
  testId: string,
  variantId: string,
  revenue?: number
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/testing/conversion-tests/${testId}/conversion`, {
    variantId,
    revenue
  });
};

// Helper Functions
function calculateWCAGScore(results: AxeResults): number {
  const totalIssues = results.violations.length;
  const criticalIssues = results.violations.filter(v => v.impact === 'critical').length;
  const seriousIssues = results.violations.filter(v => v.impact === 'serious').length;
  const moderateIssues = results.violations.filter(v => v.impact === 'moderate').length;
  const minorIssues = results.violations.filter(v => v.impact === 'minor').length;

  // Weight the issues based on severity
  const weightedScore = (criticalIssues * 4 + seriousIssues * 3 + moderateIssues * 2 + minorIssues) / totalIssues;
  return Math.max(0, 100 - weightedScore * 20); // Convert to 0-100 scale
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    browser: getBrowserInfo()
  };
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'Internet Explorer';
  
  return browser;
} 