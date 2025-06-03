export type PersonaType = 'launch' | 'scale' | 'master' | 'invest' | 'connect' | 'unknown';

export interface Persona {
  id: PersonaType;
  title: string;
  description: string;
  memberCount: string;
  ctaText: string;
  ctaHref: string;
  accentColorClass: string;
  borderColorClass: string;
  buttonColorClass: string;
  shadowColorClass: string;
  longDescription: string;
  mascotImage: string;
  recommendedResources: {
    title: string;
    type: string;
    link: string;
  }[];
  serviceTierPreview: {
    name: string;
    price: string;
    features: string[];
    cta: string;
  }[];
  strategySessionLink: string;
} 