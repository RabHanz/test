import React from 'react';
import { motion } from 'framer-motion';
import InvestHubPage from '@/components/hubs/invest/InvestHubPage';

export const metadata = {
  title: 'Invest Hub - Ecommerce Outset',
  description: 'Invest in Amazon businesses with our comprehensive investment hub.',
};

export default function InvestPage() {
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <motion.div
      key="invest"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <InvestHubPage />
    </motion.div>
  );
} 