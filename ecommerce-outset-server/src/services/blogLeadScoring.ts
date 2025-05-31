import { PersonaType } from '../types/persona';

interface BlogInteraction {
  articleId: string;
  category: string;
  personaType?: PersonaType;
  readTime: number;
  interactions: {
    comments?: boolean;
    shares?: boolean;
    saves?: boolean;
    relatedArticles?: number;
  };
}

interface BlogLeadScore {
  totalScore: number;
  qualification: 'Hot' | 'Warm' | 'Cold';
  interests: string[];
  recommendations: string[];
}

class BlogLeadScoringService {
  private readonly SCORE_THRESHOLDS = {
    HOT: 75,
    WARM: 50,
  };

  private readonly INTERACTION_WEIGHTS = {
    readTime: 0.4,
    comments: 0.2,
    shares: 0.15,
    saves: 0.15,
    relatedArticles: 0.1,
  };

  private readonly CATEGORY_WEIGHTS = {
    'product-research': 1.2,
    'ppc-optimization': 1.0,
    'business-growth': 1.1,
    'inventory-management': 0.9,
    'marketing-strategy': 1.0,
  };

  calculateLeadScore(interactions: BlogInteraction[]): BlogLeadScore {
    let totalScore = 0;
    const interests: Set<string> = new Set();
    const recommendations: string[] = [];

    interactions.forEach((interaction) => {
      // Calculate base score from read time (max 40 points)
      const readTimeScore = Math.min(interaction.readTime / 5, 40) * this.INTERACTION_WEIGHTS.readTime;

      // Calculate interaction scores
      const interactionScore = 
        (interaction.interactions.comments ? 20 : 0) * this.INTERACTION_WEIGHTS.comments +
        (interaction.interactions.shares ? 15 : 0) * this.INTERACTION_WEIGHTS.shares +
        (interaction.interactions.saves ? 15 : 0) * this.INTERACTION_WEIGHTS.saves +
        (Math.min(interaction.interactions.relatedArticles || 0, 5) * 2) * this.INTERACTION_WEIGHTS.relatedArticles;

      // Apply category weight
      const categoryWeight = this.CATEGORY_WEIGHTS[interaction.category] || 1.0;
      const weightedScore = (readTimeScore + interactionScore) * categoryWeight;

      totalScore += weightedScore;
      interests.add(interaction.category);

      // Generate recommendations based on interactions
      if (!interaction.interactions.comments) {
        recommendations.push('Consider engaging with the community by leaving comments');
      }
      if (!interaction.interactions.shares) {
        recommendations.push('Share valuable insights with your network');
      }
      if (interaction.readTime < 3) {
        recommendations.push('Take time to fully absorb the content');
      }
    });

    // Calculate average score
    const averageScore = interactions.length > 0 ? totalScore / interactions.length : 0;

    return {
      totalScore: Math.round(averageScore),
      qualification: this.getQualification(averageScore),
      interests: Array.from(interests),
      recommendations: [...new Set(recommendations)],
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

export const blogLeadScoringService = new BlogLeadScoringService(); 