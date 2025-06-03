import type { DynamicContentVariant, PersonaId, EngagementLevel } from '@/types';

export const HERO_HEADLINE_VARIANTS: Record<PersonaId | 'default' | 'returning' | 'default_exit', DynamicContentVariant> = {
  default: {
    key: 'default_hero',
    content: 'Launch and Scale Your Amazon Business',
  },
  returning: {
    key: 'returning_hero',
    content: 'Welcome Back to Your Amazon Journey',
  },
  launch: {
    key: 'launch_hero',
    content: 'Start Your Amazon Seller Journey',
  },
  scale: {
    key: 'scale_hero',
    content: 'Scale Your Amazon Business to New Heights',
  },
  master: {
    key: 'master_hero',
    content: 'Master Advanced Amazon Selling Strategies',
  },
  invest: {
    key: 'invest_hero',
    content: 'Invest in Your Amazon Business Growth',
  },
  connect: {
    key: 'connect_hero',
    content: 'Connect with Amazon Selling Experts',
  },
  unknown: {
    key: 'unknown_hero',
    content: 'Discover Your Amazon Business Potential',
  },
  default_exit: {
    key: 'default_exit_hero',
    content: 'Don\'t Miss Out on Your Amazon Success Journey',
  },
};

export const SMART_CTA_VARIANTS: Record<EngagementLevel, {
  hero: DynamicContentVariant;
  quiz_prompt: DynamicContentVariant;
}> = {
  low: {
    hero: {
      key: 'low_hero_cta',
      content: {
        text: 'Get Started',
        actionType: 'primary',
      },
    },
    quiz_prompt: {
      key: 'low_quiz_prompt',
      content: 'Take our quick quiz to get personalized recommendations',
    },
  },
  medium: {
    hero: {
      key: 'medium_hero_cta',
      content: {
        text: 'Continue Your Journey',
        actionType: 'secondary',
      },
    },
    quiz_prompt: {
      key: 'medium_quiz_prompt',
      content: 'Update your preferences for better recommendations',
    },
  },
  high: {
    hero: {
      key: 'high_hero_cta',
      content: {
        text: 'Access Your Dashboard',
        actionType: 'tertiary',
      },
    },
    quiz_prompt: {
      key: 'high_quiz_prompt',
      content: 'Review and optimize your current strategy',
    },
  },
  very_high: {
    hero: {
      key: 'very_high_hero_cta',
      content: {
        text: 'View Advanced Analytics',
        actionType: 'tertiary',
      },
    },
    quiz_prompt: {
      key: 'very_high_quiz_prompt',
      content: 'Explore advanced optimization strategies',
    },
  },
};

export const PERSONA_SPECIFIC_EXIT_CONTENT: Record<PersonaId | 'default_exit', DynamicContentVariant> = {
  default_exit: {
    key: 'default_exit',
    content: {
      text: 'Don\'t miss out on your Amazon success journey!',
      actionType: 'primary',
    },
  },
  launch: {
    key: 'launch_exit',
    content: {
      text: 'Ready to start your Amazon journey?',
      actionType: 'primary',
    },
  },
  scale: {
    key: 'scale_exit',
    content: {
      text: 'Take your Amazon business to the next level!',
      actionType: 'primary',
    },
  },
  master: {
    key: 'master_exit',
    content: {
      text: 'Master advanced Amazon selling strategies!',
      actionType: 'primary',
    },
  },
  invest: {
    key: 'invest_exit',
    content: {
      text: 'Invest in your Amazon business growth!',
      actionType: 'primary',
    },
  },
  connect: {
    key: 'connect_exit',
    content: {
      text: 'Connect with Amazon selling experts!',
      actionType: 'primary',
    },
  },
  unknown: {
    key: 'unknown_exit',
    content: {
      text: 'Discover your Amazon business potential!',
      actionType: 'primary',
    },
  },
}; 