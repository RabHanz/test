import { PersonaType } from '../types/optimizationHub';

interface ResourceInteraction {
  resourceId: string;
  resourceType: 'template' | 'video' | 'case-study';
  category: string;
  personaType?: PersonaType;
  interactions: {
    views?: number;
    downloads?: number;
    previews?: number;
    videoProgress?: number;
    timeSpent?: number;
  };
}

interface ResourceLeadScore {
  totalScore: number;
  qualification: 'Hot' | 'Warm' | 'Cold';
  interests: string[];
  recommendations: string[];
}

class ResourceLeadScoringService {
  private readonly SCORE_THRESHOLDS = {
    HOT: 75,
    WARM: 50,
  };

  private readonly INTERACTION_WEIGHTS = {
    views: 0.2,
    downloads: 0.3,
    previews: 0.2,
    videoProgress: 0.2,
    timeSpent: 0.1,
  };

  private readonly CATEGORY_WEIGHTS = {
    'product-research': 1.2,
    'ppc-optimization': 1.0,
    'business-growth': 1.1,
    'inventory-management': 0.9,
    'marketing-strategy': 1.0,
  };

  private readonly PERSONA_WEIGHTS = {
    STARTER: 0.8,
    GROWTH: 1.0,
    ENTERPRISE: 1.2,
  };

  calculateLeadScore(interactions: ResourceInteraction[]): ResourceLeadScore {
    let totalScore = 0;
    const interests: Set<string> = new Set();
    const recommendations: string[] = [];

    interactions.forEach((interaction) => {
      // Calculate base score from interactions
      const interactionScore = 
        (interaction.interactions.views || 0) * this.INTERACTION_WEIGHTS.views +
        (interaction.interactions.downloads || 0) * 10 * this.INTERACTION_WEIGHTS.downloads +
        (interaction.interactions.previews || 0) * 5 * this.INTERACTION_WEIGHTS.previews +
        (interaction.interactions.videoProgress || 0) * this.INTERACTION_WEIGHTS.videoProgress +
        Math.min((interaction.interactions.timeSpent || 0) / 60, 10) * this.INTERACTION_WEIGHTS.timeSpent;

      // Apply category weight
      const categoryWeight = this.CATEGORY_WEIGHTS[interaction.category] || 1.0;
      
      // Apply persona weight
      const personaWeight = interaction.personaType 
        ? this.PERSONA_WEIGHTS[interaction.personaType]
        : 1.0;

      const weightedScore = interactionScore * categoryWeight * personaWeight;
      totalScore += weightedScore;
      interests.add(interaction.category);

      // Generate recommendations based on interactions
      if (!interaction.interactions.downloads) {
        recommendations.push(`Download the ${interaction.resourceType} to get more value`);
      }
      if (interaction.resourceType === 'video' && (!interaction.interactions.videoProgress || interaction.interactions.videoProgress < 50)) {
        recommendations.push('Complete the video tutorial for better understanding');
      }
      if (!interaction.interactions.previews && interaction.resourceType === 'template') {
        recommendations.push('Preview the template before downloading');
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

export const resourceLeadScoringService = new ResourceLeadScoringService(); 