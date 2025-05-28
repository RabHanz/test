import React from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import SectionWrapper from './shared/SectionWrapper';
import ChartPlaceholder from './shared/ChartPlaceholder';
import { FileTextIcon, DownloadIcon, PlayCircleIcon, MessageSquareIcon, SearchIcon } from '../icons';

const ContentPerformanceSection: React.FC = () => {
  const { contentPerformanceData } = useAnalyticsStore();

  if (!contentPerformanceData) {
    return <div className="text-center p-8 text-gray-300">Loading content performance data...</div>;
  }

  const { pageEngagement, resourceDownloads, videoCompletion, communityMetrics } = contentPerformanceData;

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionWrapper title="Page Engagement Analysis" actions={<FileTextIcon className="w-5 h-5 text-orange-400"/>}>
        <ChartPlaceholder title="Top Engaged Pages (Avg. Time)" height="h-72" message="Bar chart showing pages with highest average engagement time, possibly segmented by persona." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
              <tr>
                <th scope="col" className="px-3 py-2">Page Path</th>
                <th scope="col" className="px-3 py-2">Avg. Time</th>
                <th scope="col" className="px-3 py-2">Persona Focus</th>
              </tr>
            </thead>
            <tbody>
              {pageEngagement.slice(0, 5).map((page, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/70">
                  <td className="px-3 py-2 font-medium text-gray-200 whitespace-nowrap">{page.page}</td>
                  <td className="px-3 py-2">{page.avgTime}</td>
                  <td className="px-3 py-2 capitalize">{page.persona || 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionWrapper title="Resource Downloads" actions={<DownloadIcon className="w-5 h-5 text-orange-400"/>}>
          <ChartPlaceholder title="Top Downloaded Resources" height="h-64" message="Bar chart listing resources by download count." />
           <div className="mt-3 space-y-1.5">
            {resourceDownloads.slice(0,3).map(item => (
              <div key={item.name} className="text-xs flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300 truncate pr-2">{item.name}:</span>
                <span className="font-semibold text-orange-300">{item.downloads.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Video Engagement" actions={<PlayCircleIcon className="w-5 h-5 text-orange-400"/>}>
          <ChartPlaceholder title="Video Completion Rates" height="h-64" message="Chart showing average completion rates for key videos." />
           <div className="mt-3 space-y-1.5">
            {videoCompletion.slice(0,3).map(item => (
              <div key={item.video} className="text-xs flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300 truncate pr-2">{item.video}:</span>
                <span className="font-semibold text-orange-300">{item.rate}%</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper title="Community Integration Metrics" actions={<MessageSquareIcon className="w-5 h-5 text-orange-400"/>}>
        <ChartPlaceholder title="Community Activity Trends" height="h-72" message="Line chart for metrics like active users, posts, comments over time." />
        {/* <div className="mt-2 text-xs text-gray-500">Mock data: {JSON.stringify(communityMetrics)}</div> */}
      </SectionWrapper>
      
      <SectionWrapper title="Internal Site Search Analysis" actions={<SearchIcon className="w-5 h-5 text-orange-400"/>}>
         <p className="text-gray-400 text-sm mb-3">
           Understanding what users are searching for on your site can reveal content gaps and user intent.
         </p>
         <ChartPlaceholder title="Top Internal Search Terms" height="h-64" message="Table or bar chart of most frequent search queries and their click-through rates to results." />
         <p className="text-xs text-gray-600 mt-2">Data would come from your site's search analytics integration.</p>
      </SectionWrapper>
      
      <SectionWrapper title="Automated Insights & Recommendations (Conceptual)">
         <p className="text-gray-400 text-sm mb-2">
           AI-driven analysis would highlight key findings and suggest actions. Examples:
         </p>
         <ul className="list-disc list-inside text-sm text-gray-300 space-y-1.5 pl-4 mt-2">
            <li>"Content on 'PPC Optimization' is highly engaging for 'Scaling Sarah' persona. Consider creating a premium workshop."</li>
            <li>"The resource 'First Product Launch Guide' has a high download rate but low conversion to quiz completion. Review CTA on download page."</li>
            <li>"Video 'Intro to EO Ecosystem' has a 75% completion rate. Promote this video more prominently."</li>
         </ul>
         <p className="text-xs text-gray-600 mt-3">Advanced feature requiring data science capabilities and integration with content metadata.</p>
      </SectionWrapper>

    </div>
  );
};

export default ContentPerformanceSection;
