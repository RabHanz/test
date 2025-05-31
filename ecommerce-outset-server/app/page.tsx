'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import PersonaSection from '@/components/PersonaSection';
import SocialProofSection from '@/components/SocialProofSection';
import Footer from '@/components/layout/Footer';
import { useVisitorStore } from '@/store/visitorStore';
import { HERO_HEADLINE_VARIANTS, SMART_CTA_VARIANTS } from '@/constants';

export default function HomePage() {
  const { determinedPersonaId, engagementLevel, isEmailSubscriber } = useVisitorStore();

  // Determine headline based on persona or default
  const headline = HERO_HEADLINE_VARIANTS[determinedPersonaId || (engagementLevel === 'low' ? 'default' : 'returning')].content as string;
  const cta = SMART_CTA_VARIANTS[engagementLevel].hero.content as { text: string; actionType: string; variant?: string };

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <motion.div
      key="landing"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <HeroSection headlineVariant={headline} ctaVariant={cta} />
      <PersonaSection />
      <SocialProofSection />
      <Footer showNewsletterSignup={!isEmailSubscriber} />
    </motion.div>
  );
} 