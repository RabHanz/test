import React from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import SectionWrapper from './shared/SectionWrapper';
import DataCard from './shared/DataCard';
import ChartPlaceholder from './shared/ChartPlaceholder';
import { UsersIcon, TrendingUpIcon, TrendingDownIcon, ZapIcon } from '../icons';

const DashboardOverview: React.FC = () => {
  const { overviewData } = useAnalyticsStore();

  if (!overviewData) {
    return <div className="text-center p-8 text-gray-300">Loading overview data...</div>;
  }

  const { realTimeVisitors, personaBreakdown, kpis, comparison } = overviewData;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionWrapper title="Real-time Activity" className="md:col-span-1">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 text-orange-400 mx-auto mb-2" />
            <p className="text-5xl font-bold text-white">{realTimeVisitors}</p>
            <p className="text-sm text-gray-400">Active Visitors Now</p>
            <p className="text-xs text-gray-500 mt-3">(Simulated - updates periodically)</p>
          </div>
        </SectionWrapper>
        <SectionWrapper title="Today vs Yesterday" className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {comparison.map(item => {
              const isPositive = item.today >= item.yesterday;
              const diff = item.today - item.yesterday;
              const percentageChange = item.yesterday === 0 ? (item.today > 0 ? 100 : 0) : ((diff / item.yesterday) * 100);
              return (
                <div key={item.metric} className="bg-gray-700/70 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-400">{item.metric}</p>
                  <p className="text-2xl font-semibold text-white">{item.today.toLocaleString()}</p>
                  <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUpIcon className="inline w-3 h-3 mr-1"/> : <TrendingDownIcon className="inline w-3 h-3 mr-1"/>}
                    {percentageChange.toFixed(1)}% 
                    ({diff > 0 ? '+' : ''}{diff.toLocaleString()})
                  </p>
                </div>
              );
            })}
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper title="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi, index) => (
            <DataCard key={kpi.id} item={kpi} index={index} />
          ))}
        </div>
      </SectionWrapper>
      
      <SectionWrapper title="Visitor Persona Breakdown">
         <ChartPlaceholder title="Visitor Distribution by Persona" height="h-72" message="Pie chart showing persona distribution." />
         {/* <div className="mt-2 text-xs text-gray-500">Mock data: {JSON.stringify(personaBreakdown)}</div> */}
      </SectionWrapper>

      <SectionWrapper title="Quick Actions">
        <div className="flex flex-wrap gap-3">
            <button className="btn-secondary-sm"><ZapIcon className="w-4 h-4 mr-1.5 inline-block"/>View Full GA4 Report</button>
            <button className="btn-secondary-sm"><ZapIcon className="w-4 h-4 mr-1.5 inline-block"/>Generate Lead List</button>
            <button className="btn-secondary-sm"><ZapIcon className="w-4 h-4 mr-1.5 inline-block"/>Check System Alerts</button>
        </div>
         <p className="text-xs text-gray-500 mt-3">Note: Buttons are placeholders.</p>
      </SectionWrapper>
      <style>{`
        .btn-secondary-sm { 
            background-color: #374151; /* bg-gray-700 */
            color: #D1D5DB; /* text-gray-300 */
            font-size: 0.75rem; /* text-xs */
            font-weight: 500; /* font-medium */
            padding: 0.375rem 0.75rem; /* py-1.5 px-3 */
            border-radius: 0.375rem; /* rounded-md */
            transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
            transition-duration: 150ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-secondary-sm:hover {
            background-color: #4B5563; /* hover:bg-gray-600 */
        }
      `}</style>
    </div>
  );
};

export default DashboardOverview;