import React from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import SectionWrapper from './shared/SectionWrapper';
import ChartPlaceholder from './shared/ChartPlaceholder';
import { SearchIcon, UsersIcon as SocialIcon, LinkIcon, MailIcon, ZapIcon as PaidIcon } from '../icons';

const TrafficSourcesAnalytics: React.FC = () => {
  const { trafficSourcesData } = useAnalyticsStore();

  if (!trafficSourcesData) {
    return <div className="text-center p-8 text-gray-300">Loading traffic sources data...</div>;
  }

  const { organic, social, direct, email, paid } = trafficSourcesData;

  const renderDetailList = (items: string[] | { name: string, value: number }[] | undefined, itemType?: string) => {
    if (!items || items.length === 0) return <p className="text-xs text-gray-500">No details available.</p>;
    return (
      <ul className="list-none text-xs text-gray-400 space-y-1 mt-1">
        {items.slice(0, 3).map((item, index) => ( // Show top 3
          <li key={index} className="truncate">
            {typeof item === 'string' ? item : `${item.name}: ${item.value.toLocaleString()}${itemType ? ' ' + itemType : ''}`}
          </li>
        ))}
      </ul>
    );
  };
  
  const renderCampaignList = (campaigns: { name: string, value: number, metric: string }[] | undefined) => {
     if (!campaigns || campaigns.length === 0) return <p className="text-xs text-gray-500">No campaign data.</p>;
    return (
      <ul className="space-y-1.5 text-xs text-gray-400 mt-1">
        {campaigns.slice(0, 3).map((campaign, index) => ( // Show top 3
          <li key={index} className="flex justify-between items-center bg-gray-700/50 p-1.5 rounded">
            <span className="truncate pr-2">{campaign.name}</span>
            <span className="font-medium text-orange-300 whitespace-nowrap">{campaign.value.toLocaleString()} {campaign.metric}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionWrapper title="Traffic Sources Overview">
        <ChartPlaceholder title="Traffic Distribution by Channel" height="h-72" message="Pie or Bar chart showing traffic percentages from each channel." />
      </SectionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionWrapper title={organic.name} actions={<SearchIcon className="w-5 h-5 text-orange-400"/>}>
          <p className="text-2xl font-bold text-white mb-1">{organic.value.toLocaleString()} <span className="text-sm text-gray-400">Visitors</span></p>
          <h4 className="text-xs font-semibold text-gray-300 mt-3 mb-1">Top Keywords:</h4>
          {renderDetailList(organic.details as string[] | undefined)}
        </SectionWrapper>

        <SectionWrapper title={social.name} actions={<SocialIcon className="w-5 h-5 text-orange-400"/>}>
           <p className="text-2xl font-bold text-white mb-1">{social.value.toLocaleString()} <span className="text-sm text-gray-400">Visitors</span></p>
            <h4 className="text-xs font-semibold text-gray-300 mt-3 mb-1">Breakdown:</h4>
            {social.breakdown && renderDetailList(social.breakdown as {name:string, value:number}[], 'visitors')}
        </SectionWrapper>
        
        <SectionWrapper title={direct.name} actions={<LinkIcon className="w-5 h-5 text-orange-400"/>}>
            <p className="text-2xl font-bold text-white">{direct.value.toLocaleString()} <span className="text-sm text-gray-400">Visitors</span></p>
        </SectionWrapper>
        
        <SectionWrapper title={email.name} className="md:col-span-2 lg:col-span-2" actions={<MailIcon className="w-5 h-5 text-orange-400"/>}>
            <p className="text-2xl font-bold text-white mb-1">{email.value.toLocaleString()} <span className="text-sm text-gray-400">Visitors</span></p>
            <h4 className="text-xs font-semibold text-gray-300 mt-3 mb-1">Top Campaigns:</h4>
            {email.campaignPerformance && renderCampaignList(email.campaignPerformance)}
        </SectionWrapper>

        <SectionWrapper title={paid.name} className="lg:col-span-1" actions={<PaidIcon className="w-5 h-5 text-orange-400"/>}>
            <p className="text-2xl font-bold text-white mb-1">{paid.value.toLocaleString()} <span className="text-sm text-gray-400">Visitors</span></p>
            {paid.roi && <p className="text-lg font-semibold text-green-400 mt-2">ROI: {paid.roi}</p>}
            <h4 className="text-xs font-semibold text-gray-300 mt-3 mb-1">Top Ads (Placeholder):</h4>
            {renderDetailList(["Ad Group A", "Ad Group B"])}
        </SectionWrapper>
      </div>
    </div>
  );
};

export default TrafficSourcesAnalytics;
