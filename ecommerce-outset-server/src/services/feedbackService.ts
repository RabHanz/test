import { monitoringService } from './monitoringService';
import axios from 'axios';

export interface FeedbackResponse {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  content: string;
  rating?: number;
  context: {
    page: string;
    timestamp: number;
    userAgent: string;
    screenSize: string;
    additionalData?: Record<string, any>;
  };
  status: 'pending' | 'in_review' | 'resolved' | 'declined';
  createdAt: number;
  updatedAt: number;
}

export interface FeedbackSurvey {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    type: 'rating' | 'text' | 'multiple_choice';
    question: string;
    options?: string[];
    required: boolean;
  }>;
  trigger: {
    type: 'time_on_page' | 'interaction_count' | 'exit_intent' | 'custom';
    value: number;
  };
}

class FeedbackService {
  private static instance: FeedbackService;
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  private activeSurveys: Map<string, FeedbackSurvey> = new Map();
  private feedbackQueue: FeedbackResponse[] = [];
  private readonly MAX_QUEUE_SIZE = 50;

  private constructor() {
    this.loadActiveSurveys();
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  private async loadActiveSurveys(): Promise<void> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/feedback/surveys/active`);
      response.data.forEach((survey: FeedbackSurvey) => {
        this.activeSurveys.set(survey.id, survey);
      });
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'feedback_service',
        action: 'load_active_surveys'
      });
    }
  }

  public async submitFeedback(feedback: Omit<FeedbackResponse, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const timestamp = Date.now();
    const newFeedback: FeedbackResponse = {
      ...feedback,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.feedbackQueue.push(newFeedback);
    if (this.feedbackQueue.length >= this.MAX_QUEUE_SIZE) {
      await this.flushFeedbackQueue();
    }

    monitoringService.trackUserExperience({
      type: 'interaction',
      name: 'feedback_submitted',
      success: true,
      context: {
        feedbackType: feedback.type,
        page: feedback.context.page
      }
    });
  }

  private async flushFeedbackQueue(): Promise<void> {
    if (this.feedbackQueue.length === 0) return;

    const feedbackToSubmit = [...this.feedbackQueue];
    this.feedbackQueue = [];

    try {
      await axios.post(`${this.API_BASE_URL}/feedback/batch`, {
        feedback: feedbackToSubmit
      });
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'feedback_service',
        action: 'flush_feedback_queue'
      });
      // Put failed submissions back in queue
      this.feedbackQueue = [...feedbackToSubmit, ...this.feedbackQueue];
    }
  }

  public getActiveSurveys(): FeedbackSurvey[] {
    return Array.from(this.activeSurveys.values());
  }

  public shouldShowSurvey(surveyId: string, userContext: {
    timeOnPage: number;
    interactionCount: number;
    isExiting: boolean;
  }): boolean {
    const survey = this.activeSurveys.get(surveyId);
    if (!survey) return false;

    switch (survey.trigger.type) {
      case 'time_on_page':
        return userContext.timeOnPage >= survey.trigger.value;
      case 'interaction_count':
        return userContext.interactionCount >= survey.trigger.value;
      case 'exit_intent':
        return userContext.isExiting;
      default:
        return false;
    }
  }

  public async submitSurveyResponse(surveyId: string, responses: Record<string, any>): Promise<void> {
    try {
      await axios.post(`${this.API_BASE_URL}/feedback/surveys/${surveyId}/responses`, {
        responses,
        timestamp: Date.now()
      });

      monitoringService.trackUserExperience({
        type: 'interaction',
        name: 'survey_completed',
        success: true,
        context: {
          surveyId,
          responseCount: Object.keys(responses).length
        }
      });
    } catch (error) {
      monitoringService.trackError(error as Error, {
        context: 'feedback_service',
        action: 'submit_survey_response',
        surveyId
      });
    }
  }
}

export const feedbackService = FeedbackService.getInstance(); 