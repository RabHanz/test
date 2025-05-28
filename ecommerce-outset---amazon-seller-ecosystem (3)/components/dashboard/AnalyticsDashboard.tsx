import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAnalyticsStore from '../../store/analyticsStore';
import DashboardOverview from './DashboardOverview';
import TrafficSourcesAnalytics from './TrafficSourcesAnalytics';
import PersonaAnalyticsSection from './PersonaAnalyticsSection';
import ConversionTrackingSection from './ConversionTrackingSection';
import ShadowFunnelMetricsSection from './ShadowFunnelMetricsSection';
import ContentPerformanceSection from './ContentPerformanceSection';
import FilterControls from './shared/FilterControls';
import { BarChartIcon, UsersIcon, TrendingUpIcon, ZapIcon, FilterIcon as SectionFilterIcon, FileTextIcon } from '../icons';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: BarChartIcon },
  { id: 'traffic', label: 'Traffic Sources', Icon: ZapIcon },
  { id: 'persona', label: 'Persona Insights', Icon: UsersIcon },
  { id: 'conversion', label: 'Conversion Funnel', Icon: TrendingUpIcon },
  { id: 'shadow', label: 'Shadow Funnel', Icon: SectionFilterIcon },
  { id: 'content', label: 'Content Performance', Icon: FileTextIcon },
];

const AnalyticsDashboard: React.FC = () => {
  const {
    fetchData,
    isLoading,
    activeTab,
    setActiveTab,
    overviewData // Check if overviewData exists to prevent full page loader after initial load
  } = useAnalyticsStore();

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      // console.log("Simulating real-time data fetch for dashboard...");
      // fetchData(); // Potentially re-fetch for real-time effect
    }, 60000); 
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const renderActiveTabContent = () => {
    if (isLoading && !overviewData) { 
      return <div className="flex justify-center items-center h-64"><p className="text-xl text-gray-300">Loading dashboard data...</p></div>;
    }
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'traffic':
        return <TrafficSourcesAnalytics />;
      case 'persona':
        return <PersonaAnalyticsSection />;
      case 'conversion':
        return <ConversionTrackingSection />;
      case 'shadow':
        return <ShadowFunnelMetricsSection />;
      case 'content':
        return <ContentPerformanceSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-24"
    >
      <div className="container mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Analytics Dashboard</h1>
            <FilterControls />
          </div>
        </header>

        <div className="mb-6 md:mb-8 overflow-x-auto">
          <nav className="flex space-x-1 border-b border-gray-700 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-3 px-3 md:px-4 font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none
                  ${activeTab === tab.id
                    ? 'border-b-2 border-orange-500 text-orange-400'
                    : 'text-gray-400 hover:text-orange-400 border-b-2 border-transparent hover:border-gray-500'
                  }`}
              >
                <tab.Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {renderActiveTabContent()}
            </motion.div>
        </AnimatePresence>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Analytics data is illustrative. Last updated: {new Date().toLocaleTimeString()}.</p>
        </footer>
      </div>
       <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
      `}</style>
    </motion.div>
  );
};

export default AnalyticsDashboard;