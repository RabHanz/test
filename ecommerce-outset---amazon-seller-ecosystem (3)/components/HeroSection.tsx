
import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import Button from './Button';
import { HERO_STATS_DATA } from '../constants';
import { trackCTAClick } from '../utils/trackingUtils'; // Updated Import
import type { Stat } from '../types';
import useQuizStore from '../store/quizStore'; // For quiz modal trigger

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ to, duration = 2, suffix = '', prefix = '', className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]); // to and duration changes should re-trigger

  return (
    <span className={`font-bold ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

interface HeroSectionProps {
  headlineVariant: string;
  ctaVariant: { text: string; actionType: string; variant?: string };
}

const HeroSection: React.FC<HeroSectionProps> = ({ headlineVariant, ctaVariant }) => {

  const handleCtaClick = () => {
    trackCTAClick(`Hero CTA - ${ctaVariant.text}`);
    switch (ctaVariant.actionType) {
      case 'quiz':
        window.location.hash = 'quiz-modal';
        break;
      case 'pathways':
        window.location.hash = '#pathways';
        break;
      case 'services':
        // Determine specific service page later, for now, generic placeholder
        window.location.href = '#'; // Placeholder
        alert("Placeholder: Link to relevant services page");
        break;
      case 'consult':
         window.location.href = '#book-consult'; // Placeholder
         alert("Placeholder: Link to booking page for consultation");
        break;
      default:
        window.location.hash = 'quiz-modal'; // Fallback to quiz
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-12 bg-gradient-to-br from-orange-500 via-blue-700 to-gray-900">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          <span className="block">{headlineVariant}</span>
          {/* Sub-headline or second part of headline can also be dynamic if needed */}
          {!headlineVariant.toLowerCase().includes("journey") && !headlineVariant.toLowerCase().includes("success") &&
            <span className="block gradient-text bg-gradient-to-r from-orange-300 to-yellow-300">Journey with Systematic Success</span>
          }
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-xl mx-auto">
          The Complete Amazon Ecosystem: Where Every Member Finds Their Perfect Next Step.
        </p>
        <Button
          variant={ctaVariant.variant as 'primary' | 'secondary' || 'primary'} // Default to primary if not specified
          size="lg"
          onClick={handleCtaClick}
          className="text-lg shadow-xl hover:shadow-orange-500/50"
        >
          {ctaVariant.text}
        </Button>

        {/* Stats Bar */}
        <motion.div
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          {HERO_STATS_DATA.map((stat, index) => (
            <div key={index} className="text-white">
              <AnimatedCounter
                to={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                className="text-3xl md:text-4xl"
              />
              <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
