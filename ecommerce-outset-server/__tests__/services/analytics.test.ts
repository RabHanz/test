import { AnalyticsService } from '@/services/analytics';

// Mock the fetch function
global.fetch = jest.fn();

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks calculator use event', async () => {
    const eventData = {
      calculatorType: 'fba-profit',
      score: 90,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await AnalyticsService.trackCalculatorUse(eventData);

    expect(global.fetch).toHaveBeenCalledWith('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'calculator_use',
        eventData,
      }),
    });
  });

  it('tracks lead capture event', async () => {
    const eventData = {
      email: 'test@example.com',
      name: 'Test User',
      calculatorType: 'fba-profit',
      score: 90,
      results: {
        profit: 100,
        margin: 0.5,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await AnalyticsService.trackLeadCapture(eventData);

    expect(global.fetch).toHaveBeenCalledWith('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'lead_capture',
        eventData,
      }),
    });
  });

  it('tracks resource view event', async () => {
    const eventData = {
      resourceId: '1',
      resourceType: 'guide',
      persona: 'new-seller',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await AnalyticsService.trackResourceView(eventData);

    expect(global.fetch).toHaveBeenCalledWith('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: 'resource_view',
        eventData,
      }),
    });
  });

  it('handles API errors gracefully', async () => {
    const eventData = {
      calculatorType: 'fba-profit',
      score: 90,
    };

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    await expect(AnalyticsService.trackCalculatorUse(eventData)).rejects.toThrow(
      'Failed to track analytics event'
    );
  });

  it('handles non-OK responses', async () => {
    const eventData = {
      calculatorType: 'fba-profit',
      score: 90,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(AnalyticsService.trackCalculatorUse(eventData)).rejects.toThrow(
      'Failed to track analytics event'
    );
  });
}); 