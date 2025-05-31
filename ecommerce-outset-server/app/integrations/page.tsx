'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IntegrationsDashboardPage } from '@/components/integrations/IntegrationsDashboardPage';

export default function IntegrationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <IntegrationsDashboardPage />
    </motion.div>
  );
} 