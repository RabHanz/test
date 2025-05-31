import { createMocks } from 'node-mocks-http';
import captureLead from '@/pages/api/leads/capture';
import { AnalyticsService } from '@/services/analytics';
import { LeadScoringService } from '@/services/leadScoring';

// Mock the services
jest.mock('@/services/analytics');
jest.mock('@/services/leadScoring');

describe('Lead Capture API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a lead and returns success response', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test User',
        calculatorType: 'fba-profit',
        score: 90,
        results: {
          profit: 100,
          margin: 0.5,
        },
      },
    });

    // Mock the services
    (AnalyticsService.trackLeadCapture as jest.Mock).mockResolvedValue(undefined);
    (LeadScoringService.calculateScore as jest.Mock).mockReturnValue(90);

    await captureLead(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Lead captured successfully',
    });

    // Verify service calls
    expect(AnalyticsService.trackLeadCapture).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      calculatorType: 'fba-profit',
      score: 90,
      results: {
        profit: 100,
        margin: 0.5,
      },
    });
  });

  it('returns error for invalid request method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await captureLead(req, res);

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
        name: 'Test User',
        calculatorType: 'fba-profit',
      },
    });

    await captureLead(req, res);

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
        email: 'test@example.com',
        name: 'Test User',
        calculatorType: 'fba-profit',
        score: 90,
        results: {
          profit: 100,
          margin: 0.5,
        },
      },
    });

    // Mock service error
    (AnalyticsService.trackLeadCapture as jest.Mock).mockRejectedValue(
      new Error('Service error')
    );

    await captureLead(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Internal server error',
    });
  });
}); 