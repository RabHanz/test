import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChartIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from '../icons';
import type { AnalyticsData } from '@/types';

interface TimeRange {
  start: Date;
  end: Date;
}

export default function AnalyticsReport() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch('/api/analytics/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: timeRange.start.toISOString(),
            endDate: timeRange.end.toISOString(),
          }),
        });
        if (!response.ok) throw new Error('Failed to fetch report data');
        const reportData = await response.json();
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [timeRange]);

  if (isLoading) return <div className="text-center p-8">Loading report...</div>;
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
            Analytics Report
          </h1>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setTimeRange({
                start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                end: new Date(),
              })}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange({
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date(),
              })}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange({
                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                end: new Date(),
              })}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Last 90 Days
            </button>
          </div>
        </header>

        {/* Key Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Visitors"
              value={data.visitors.toLocaleString()}
              icon={<UsersIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Page Views"
              value={data.pageViews.toLocaleString()}
              icon={<BarChartIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Bounce Rate"
              value={`${data.bounceRate.toFixed(1)}%`}
              icon={<TrendingUpIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${data.conversionRate.toFixed(1)}%`}
              icon={<ShoppingCartIcon className="w-6 h-6" />}
            />
          </div>
        </section>

        {/* Additional sections for detailed charts and analysis can be added here */}
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