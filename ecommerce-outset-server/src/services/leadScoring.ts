import { PersonaType } from '../types/persona';

interface CalculatorScore {
  score: number;
  calculatorType: string;
  personaType?: PersonaType;
}

interface LeadScore {
  totalScore: number;
  qualification: 'Hot' | 'Warm' | 'Cold';
  recommendations: string[];
}

class LeadScoringService {
  private readonly SCORE_THRESHOLDS = {
    HOT: 75,
    WARM: 50,
  };

  private readonly CALCULATOR_WEIGHTS = {
    'FBA Profit Calculator': 1.2,
    'Product Research Validator': 1.0,
    'PPC Optimization Tool': 0.8,
    'Business Health Assessment': 1.5,
  };

  private readonly PERSONA_WEIGHTS = {
    STARTER: 0.8,
    GROWTH: 1.0,
    ENTERPRISE: 1.2,
  };

  calculateLeadScore(scores: CalculatorScore[]): LeadScore {
    let totalScore = 0;
    let weightedCount = 0;
    const recommendations: string[] = [];

    scores.forEach(({ score, calculatorType, personaType }) => {
      const calculatorWeight = this.CALCULATOR_WEIGHTS[calculatorType] || 1.0;
      const personaWeight = personaType ? this.PERSONA_WEIGHTS[personaType] : 1.0;
      
      const weightedScore = score * calculatorWeight * personaWeight;
      totalScore += weightedScore;
      weightedCount += calculatorWeight * personaWeight;

      // Generate recommendations based on score
      if (score < 50) {
        recommendations.push(
          `Consider improving your ${calculatorType.toLowerCase()} results`
        );
      }
    });

    const averageScore = weightedCount > 0 ? totalScore / weightedCount : 0;

    return {
      totalScore: Math.round(averageScore),
      qualification: this.getQualification(averageScore),
      recommendations,
    };
  }

  private getQualification(score: number): 'Hot' | 'Warm' | 'Cold' {
    if (score >= this.SCORE_THRESHOLDS.HOT) {
      return 'Hot';
    } else if (score >= this.SCORE_THRESHOLDS.WARM) {
      return 'Warm';
    }
    return 'Cold';
  }
}

export const leadScoringService = new LeadScoringService(); 