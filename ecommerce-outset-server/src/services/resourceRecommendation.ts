import { ResourceMetadata } from '../config/resourceClassification';
import { PersonaType } from '../types/optimizationHub';

interface UserBehavior {
  viewedResources: string[];
  downloadedResources: string[];
  completedResources: string[];
  lastViewedCategories: string[];
  preferredFormats: string[];
  personaType: PersonaType;
}

interface RecommendationScore {
  resource: ResourceMetadata;
  score: number;
  reasons: string[];
}

export class ResourceRecommendationService {
  private readonly CATEGORY_WEIGHT = 0.3;
  private readonly FORMAT_WEIGHT = 0.2;
  private readonly PERSONA_WEIGHT = 0.25;
  private readonly POPULARITY_WEIGHT = 0.15;
  private readonly RECENCY_WEIGHT = 0.1;

  constructor(private resources: ResourceMetadata[]) {}

  getRecommendations(
    userBehavior: UserBehavior,
    limit: number = 5
  ): RecommendationScore[] {
    const scoredResources = this.resources
      .filter((resource) => !userBehavior.completedResources.includes(resource.id))
      .map((resource) => this.calculateScore(resource, userBehavior));

    return scoredResources
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateScore(
    resource: ResourceMetadata,
    userBehavior: UserBehavior
  ): RecommendationScore {
    const reasons: string[] = [];
    let score = 0;

    // Category relevance
    const categoryScore = this.calculateCategoryScore(
      resource,
      userBehavior.lastViewedCategories
    );
    score += categoryScore * this.CATEGORY_WEIGHT;
    if (categoryScore > 0.7) {
      reasons.push('Matches your recent interests');
    }

    // Format preference
    const formatScore = this.calculateFormatScore(
      resource,
      userBehavior.preferredFormats
    );
    score += formatScore * this.FORMAT_WEIGHT;
    if (formatScore > 0.7) {
      reasons.push('Matches your preferred format');
    }

    // Persona alignment
    const personaScore = this.calculatePersonaScore(
      resource,
      userBehavior.personaType
    );
    score += personaScore * this.PERSONA_WEIGHT;
    if (personaScore > 0.7) {
      reasons.push('Perfect for your seller profile');
    }

    // Popularity
    const popularityScore = this.calculatePopularityScore(resource);
    score += popularityScore * this.POPULARITY_WEIGHT;
    if (popularityScore > 0.7) {
      reasons.push('Highly rated by other sellers');
    }

    // Recency
    const recencyScore = this.calculateRecencyScore(resource);
    score += recencyScore * this.RECENCY_WEIGHT;
    if (recencyScore > 0.7) {
      reasons.push('Recently updated');
    }

    return {
      resource,
      score,
      reasons: reasons.slice(0, 2), // Limit to top 2 reasons
    };
  }

  private calculateCategoryScore(
    resource: ResourceMetadata,
    lastViewedCategories: string[]
  ): number {
    if (lastViewedCategories.length === 0) return 0.5;
    return lastViewedCategories.includes(resource.category) ? 1 : 0;
  }

  private calculateFormatScore(
    resource: ResourceMetadata,
    preferredFormats: string[]
  ): number {
    if (preferredFormats.length === 0) return 0.5;
    return preferredFormats.includes(resource.format) ? 1 : 0;
  }

  private calculatePersonaScore(
    resource: ResourceMetadata,
    personaType: PersonaType
  ): number {
    return resource.personaTypes.includes(personaType) ? 1 : 0;
  }

  private calculatePopularityScore(resource: ResourceMetadata): number {
    const maxViews = Math.max(...this.resources.map((r) => r.views || 0));
    const maxRating = Math.max(...this.resources.map((r) => r.rating || 0));
    
    const viewScore = resource.views ? resource.views / maxViews : 0;
    const ratingScore = resource.rating ? resource.rating / maxRating : 0;
    
    return (viewScore + ratingScore) / 2;
  }

  private calculateRecencyScore(resource: ResourceMetadata): number {
    const now = new Date();
    const maxAge = 365; // 1 year in days
    const ageInDays = (now.getTime() - resource.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.max(0, 1 - ageInDays / maxAge);
  }
} 