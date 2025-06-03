import { monitoringService } from './monitoringService';
import axios from 'axios';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'tutorial' | 'form' | 'interaction' | 'video' | 'quiz';
  content: {
    type: 'text' | 'video' | 'form' | 'interaction' | 'quiz';
    data: any;
  };
  required: boolean;
  order: number;
  estimatedTime: number; // in seconds
  prerequisites: string[]; // IDs of steps that must be completed first
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  completedSteps: string[];
  startedAt: number;
  lastUpdatedAt: number;
  timeSpent: number; // in seconds
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
}

export interface OnboardingMetrics {
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: Array<{
    stepId: string;
    count: number;
    percentage: number;
  }>;
  userFeedback: Array<{
    stepId: string;
    rating: number;
    feedback: string;
  }>;
}

class OnboardingService {
  private static instance: OnboardingService;
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  private steps: Map<string, OnboardingStep> = new Map();
  private progress: Map<string, OnboardingProgress> = new Map();
  private stepStartTimes: Map<string, number> = new Map();

  private constructor() {
    this.loadOnboardingSteps();
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  private async loadOnboardingSteps(): Promise<void> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/onboarding/steps`);
      response.data.forEach((step: OnboardingStep) => {
        this.steps.set(step.id, step);
      });
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'onboarding_service',
        action: 'load_steps'
      });
    }
  }

  public async startOnboarding(userId: string): Promise<OnboardingProgress> {
    const progress: OnboardingProgress = {
      userId,
      currentStep: this.getFirstStep()?.id || '',
      completedSteps: [],
      startedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      timeSpent: 0,
      status: 'in_progress'
    };

    this.progress.set(userId, progress);
    this.stepStartTimes.set(userId, Date.now());

    monitoringService.trackUserExperience({
      type: 'interaction',
      name: 'onboarding_started',
      success: true,
      context: { userId }
    });

    return progress;
  }

  public async completeStep(userId: string, stepId: string): Promise<void> {
    const progress = this.progress.get(userId);
    if (!progress) return;

    const step = this.steps.get(stepId);
    if (!step) return;

    const startTime = this.stepStartTimes.get(userId) || Date.now();
    const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds

    progress.completedSteps.push(stepId);
    progress.timeSpent += timeSpent;
    progress.lastUpdatedAt = Date.now();

    // Set next step
    const nextStep = this.getNextStep(stepId, progress.completedSteps);
    progress.currentStep = nextStep?.id || '';

    if (!nextStep) {
      progress.status = 'completed';
    }

    this.stepStartTimes.set(userId, Date.now());

    monitoringService.trackUserExperience({
      type: 'interaction',
      name: 'onboarding_step_completed',
      success: true,
      context: {
        userId,
        stepId,
        timeSpent,
        totalSteps: this.steps.size,
        completedSteps: progress.completedSteps.length
      }
    });

    await this.saveProgress(progress);
  }

  public async abandonOnboarding(userId: string): Promise<void> {
    const progress = this.progress.get(userId);
    if (!progress) return;

    progress.status = 'abandoned';
    progress.lastUpdatedAt = Date.now();

    monitoringService.trackUserExperience({
      type: 'interaction',
      name: 'onboarding_abandoned',
      success: false,
      context: {
        userId,
        completedSteps: progress.completedSteps.length,
        timeSpent: progress.timeSpent
      }
    });

    await this.saveProgress(progress);
  }

  private getFirstStep(): OnboardingStep | undefined {
    return Array.from(this.steps.values())
      .sort((a, b) => a.order - b.order)[0];
  }

  private getNextStep(currentStepId: string, completedSteps: string[]): OnboardingStep | undefined {
    const currentStep = this.steps.get(currentStepId);
    if (!currentStep) return undefined;

    return Array.from(this.steps.values())
      .filter(step => 
        step.order > currentStep.order &&
        step.prerequisites.every(prereq => completedSteps.includes(prereq))
      )
      .sort((a, b) => a.order - b.order)[0];
  }

  private async saveProgress(progress: OnboardingProgress): Promise<void> {
    try {
      await axios.post(`${this.API_BASE_URL}/onboarding/progress`, progress);
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'onboarding_service',
        action: 'save_progress',
        userId: progress.userId
      });
    }
  }

  public getCurrentStep(userId: string): OnboardingStep | undefined {
    const progress = this.progress.get(userId);
    if (!progress) return undefined;
    return this.steps.get(progress.currentStep);
  }

  public getProgress(userId: string): OnboardingProgress | undefined {
    return this.progress.get(userId);
  }

  public async getMetrics(): Promise<OnboardingMetrics> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/onboarding/metrics`);
      return response.data;
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'onboarding_service',
        action: 'get_metrics'
      });
      return {
        completionRate: 0,
        averageTimeToComplete: 0,
        dropOffPoints: [],
        userFeedback: []
      };
    }
  }

  public getStepById(stepId: string): OnboardingStep | undefined {
    return this.steps.get(stepId);
  }

  public getAllSteps(): OnboardingStep[] {
    return Array.from(this.steps.values())
      .sort((a, b) => a.order - b.order);
  }
}

export const onboardingService = OnboardingService.getInstance(); 