import React from 'react';
import { motion } from 'framer-motion';
import ConnectHubPage from '@/components/hubs/connect/ConnectHubPage';

export const metadata = {
  title: 'Connect Hub - Ecommerce Outset',
  description: 'Connect with other Amazon sellers and service providers in our community hub.',
};

export default function ConnectPage() {
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <motion.div
      key="connect"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      <ConnectHubPage />
    </motion.div>
  );
} 