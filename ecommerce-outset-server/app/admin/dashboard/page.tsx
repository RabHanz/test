import React from 'react';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { usePerformance } from '@/hooks/usePerformance';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Dashboard</h3>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your business performance and analytics.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </div>
  );
} 