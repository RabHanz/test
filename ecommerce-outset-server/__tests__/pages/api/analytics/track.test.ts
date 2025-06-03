import { createMocks } from 'node-mocks-http';
import trackAnalytics from '@/pages/api/analytics/track';
import { AnalyticsService } from '@/services/analytics';

// Mock the analytics service
jest.mock('@/services/analytics');

describe('Analytics Tracking API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks analytics event and returns success response', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        eventType: 'calculator_use',
        eventData: {
          calculatorType: 'fba-profit',
          score: 90,
        },
      },
    });

    // Mock the service
    (AnalyticsService.trackEvent as jest.Mock).mockResolvedValue(undefined);

    await trackAnalytics(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Analytics event tracked successfully',
    });

    // Verify service call
    expect(AnalyticsService.trackEvent).toHaveBeenCalledWith({
      eventType: 'calculator_use',
      eventData: {
        calculatorType: 'fba-profit',
        score: 90,
      },
    });
  });

  it('returns error for invalid request method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await trackAnalytics(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Method not allowed',
    });
  });

  it('returns error for missing required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        eventData: {
          calculatorType: 'fba-profit',
        },
      },
    });

    await trackAnalytics(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Missing required fields',
    });
  });

  it('handles service errors gracefully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        eventType: 'calculator_use',
        eventData: {
          calculatorType: 'fba-profit',
          score: 90,
        },
      },
    });

    // Mock service error
    (AnalyticsService.trackEvent as jest.Mock).mockRejectedValue(
      new Error('Service error')
    );

    await trackAnalytics(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Internal server error',
    });
  });
}); 