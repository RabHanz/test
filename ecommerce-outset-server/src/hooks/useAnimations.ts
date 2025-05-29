import { useAnimation, AnimationControls } from 'framer-motion';
import { useEffect } from 'react';

interface AnimationProps {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
}

export const useAnimations = () => {
  const controls = useAnimation();

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  const slideUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  };

  const slideIn = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  };

  const scale = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const hover = {
    scale: 1.05,
    transition: { duration: 0.2 },
  };

  const tap = {
    scale: 0.95,
    transition: { duration: 0.1 },
  };

  const useScrollAnimation = (threshold = 0.1) => {
    useEffect(() => {
      const handleScroll = () => {
        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * (1 - threshold);
          
          if (isVisible) {
            controls.start('animate');
          }
        });
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [controls, threshold]);
  };

  return {
    controls,
    fadeIn,
    slideUp,
    slideIn,
    scale,
    stagger,
    hover,
    tap,
    useScrollAnimation,
  };
}; 