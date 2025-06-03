import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChartIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from '../icons';
import type { DashboardData, PerformanceMetrics, AnalyticsData } from '@/types';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="text-center p-8">Loading analytics...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-24"
    >
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center">
            <BarChartIcon className="w-10 h-10 text-orange-400 mr-3" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
        </header>

        {/* Performance Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Page Load"
              value={`${data.performance.pageLoad.toFixed(2)}s`}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Time to Interactive"
              value={`${data.performance.timeToInteractive.toFixed(2)}s`}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="First Contentful Paint"
              value={`${data.performance.firstContentfulPaint.toFixed(2)}s`}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Cumulative Layout Shift"
              value={data.performance.cumulativeLayoutShift.toFixed(2)}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Analytics Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Visitors"
              value={data.analytics.visitors.toLocaleString()}
              icon={<UsersIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Page Views"
              value={data.analytics.pageViews.toLocaleString()}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Bounce Rate"
              value={`${data.analytics.bounceRate.toFixed(1)}%`}
              icon={<TrendingUpIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${data.analytics.conversionRate.toFixed(1)}%`}
              icon={<ShoppingCartIcon className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Additional sections for charts and detailed metrics can be added here */}
      </div>
    </motion.div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <div className="text-orange-400">{icon}</div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
} 