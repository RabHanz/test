import { LeadScoringService } from '@/services/leadScoring';

describe('LeadScoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates score for FBA profit calculator results', () => {
    const results = {
      profit: 100,
      margin: 0.5,
    };

    const score = LeadScoringService.calculateScore('fba-profit', results);

    expect(score).toBe(90);
  });

  it('calculates score for product research validator results', () => {
    const results = {
      competition: 'low',
      demand: 'high',
      profitPotential: 'high',
    };

    const score = LeadScoringService.calculateScore('product-research', results);

    expect(score).toBe(85);
  });

  it('calculates score for PPC optimization tool results', () => {
    const results = {
      acos: 15,
      conversionRate: 0.1,
      ctr: 0.05,
    };

    const score = LeadScoringService.calculateScore('ppc-optimization', results);

    expect(score).toBe(80);
  });

  it('calculates score for business health assessment results', () => {
    const results = {
      revenue: 100000,
      profitMargin: 0.3,
      growthRate: 0.2,
    };

    const score = LeadScoringService.calculateScore('business-health', results);

    expect(score).toBe(85);
  });

  it('returns 0 for unknown calculator type', () => {
    const results = {
      someData: 'value',
    };

    const score = LeadScoringService.calculateScore('unknown-calculator', results);

    expect(score).toBe(0);
  });

  it('handles missing or invalid results data', () => {
    const results = {};

    const score = LeadScoringService.calculateScore('fba-profit', results);

    expect(score).toBe(0);
  });
}); 