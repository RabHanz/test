import React, { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DashboardMetrics, DashboardProps } from '@/types/dashboard';
import { formatMetricValue, calculateTimeAgo, getMetricChange } from '@/lib/utils/dashboard';
import { monitoringService } from '@/lib/services/monitoringService';
import { usePerformance } from '@/hooks/usePerformance';

const AnalyticsDashboard: React.FC = () => {
  const {
    funnelMetrics,
    exitIntentMetrics,
    leadScoringMetrics,
    revenueMetrics,
    loading,
    error,
    refresh
  } = useAnalytics();

  const { trackOperation } = usePerformance({ name: 'AnalyticsDashboard' });

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    if (funnelMetrics && exitIntentMetrics && leadScoringMetrics && revenueMetrics) {
      const endTracking = trackOperation('updateMetrics');
      setMetrics({
        funnelMetrics: {
          ...funnelMetrics,
          totalVisits: funnelMetrics.totalVisits || 0,
          stages: funnelMetrics.stages || []
        },
        exitIntentMetrics: {
          ...exitIntentMetrics,
          commonExitPages: exitIntentMetrics.commonExitPages || []
        },
        leadScoringMetrics: {
          ...leadScoringMetrics,
          distribution: leadScoringMetrics.distribution || []
        },
        revenueMetrics: {
          ...revenueMetrics,
          revenueBySource: revenueMetrics.revenueBySource || []
        },
        lastUpdated: Date.now()
      });
      endTracking();
    }
  }, [funnelMetrics, exitIntentMetrics, leadScoringMetrics, revenueMetrics, trackOperation]);

  useEffect(() => {
    monitoringService.trackUserExperience({
      type: 'interaction',
      name: 'analytics_dashboard_view',
      success: true,
      context: { hasMetrics: !!metrics }
    });
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {calculateTimeAgo(metrics.lastUpdated)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Funnel Metrics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Funnel Metrics</h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-500">Total Visits</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.funnelMetrics.totalVisits, 'number')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.funnelMetrics.conversionRate, 'percentage')}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue</h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.revenueMetrics.totalRevenue, 'currency')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Average Order Value</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.revenueMetrics.averageOrderValue, 'currency')}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Scoring */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Lead Scoring</h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-500">Total Leads</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.leadScoringMetrics.totalLeads, 'number')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Average Score</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.leadScoringMetrics.averageScore, 'number')}
              </div>
            </div>
          </div>
        </div>

        {/* Exit Intent */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Exit Intent</h3>
          <div className="space-y-2">
            <div>
              <div className="text-sm text-gray-500">Exit Rate</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.exitIntentMetrics.exitRate, 'percentage')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Exits</div>
              <div className="text-xl font-bold">
                {formatMetricValue(metrics.exitIntentMetrics.totalExits, 'number')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 