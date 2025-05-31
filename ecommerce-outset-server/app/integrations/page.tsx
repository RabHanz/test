'use client';

import React from 'react';
import { motion } from 'framer-motion';

// TODO: Replace this placeholder with the real IntegrationsDashboardPage implementation
const IntegrationsDashboardPage: React.FC = () => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Integrations Dashboard Placeholder</h2>
      <p>This is a placeholder for the real IntegrationsDashboardPage component.</p>
    </div>
  );
};

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