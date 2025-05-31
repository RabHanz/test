import React from 'react';
import { motion } from 'framer-motion';
import ScaleHubPage from '@/components/hubs/scale/ScaleHubPage';

export const metadata = {
  title: 'Scale Hub - Ecommerce Outset',
  description: 'Scale your Amazon business with our comprehensive scaling tools and resources.',
};

export default function ScalePage() {
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <motion.div
      key="scale"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <ScaleHubPage />
    </motion.div>
  );
} 