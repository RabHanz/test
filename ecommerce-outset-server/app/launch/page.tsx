'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LaunchHubPage from '@/components/hubs/launch/LaunchHubPage';

export default function LaunchPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LaunchHubPage />
    </motion.div>
  );
} 