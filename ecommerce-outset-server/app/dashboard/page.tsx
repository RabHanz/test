'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnalyticsDashboard />
    </motion.div>
  );
} 