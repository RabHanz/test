export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  weight: number;
}

export interface ResourceFormat {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ExperienceLevel {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const resourceCategories: ResourceCategory[] = [
  {
    id: 'product-research',
    name: 'Product Research',
    description: 'Tools and guides for product research and validation',
    weight: 1.2,
  },
  {
    id: 'ppc-optimization',
    name: 'PPC Optimization',
    description: 'Resources for optimizing PPC campaigns',
    weight: 1.0,
  },
  {
    id: 'business-growth',
    name: 'Business Growth',
    description: 'Strategies and tools for scaling your business',
    weight: 1.1,
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    description: 'Tools and guides for inventory optimization',
    weight: 0.9,
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    description: 'Comprehensive marketing guides and templates',
    weight: 1.0,
  },
];

export const resourceFormats: ResourceFormat[] = [
  {
    id: 'template',
    name: 'Templates',
    description: 'Downloadable templates and tools',
  },
  {
    id: 'video',
    name: 'Video Tutorials',
    description: 'Step-by-step video guides',
  },
  {
    id: 'case-study',
    name: 'Case Studies',
    description: 'Success stories and examples',
  },
  {
    id: 'guide',
    name: 'Guides',
    description: 'Comprehensive written guides',
  },
  {
    id: 'checklist',
    name: 'Checklists',
    description: 'Actionable checklists and workflows',
  },
];

export const experienceLevels: ExperienceLevel[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Resources for those new to Amazon selling',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Resources for growing sellers',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Resources for experienced sellers',
  },
];

export interface ResourceMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  experienceLevel: string;
  tags: string[];
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  lastUpdated: Date;
  author?: string;
  downloads?: number;
  views?: number;
  rating?: number;
  personaTypes: string[];
} 