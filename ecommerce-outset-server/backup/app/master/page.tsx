import React from 'react';
import { motion } from 'framer-motion';
import MasterHubPage from '@/components/hubs/master/MasterHubPage';

export const metadata = {
  title: 'Master Hub - Ecommerce Outset',
  description: 'Master advanced Amazon selling strategies with our comprehensive master hub.',
};

export default function MasterPage() {
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <motion.div
      key="master"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <MasterHubPage />
    </motion.div>
  );
} 