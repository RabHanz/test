import React from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import SectionWrapper from './shared/SectionWrapper';
import DataCard from './shared/DataCard';
import ChartPlaceholder from './shared/ChartPlaceholder';
import { ZapIcon, MailIcon } from '../icons';
import type { KpiCardData } from '../../../types';

const ShadowFunnelMetricsSection: React.FC = () => {
  const { shadowFunnelData } = useAnalyticsStore();

  if (!shadowFunnelData) {
    return <div className="text-center p-8 text-gray-300">Loading shadow funnel data...</div>;
  }

  const { exitIntentPopup, abandonedQuizRecovery, retargetingEffectiveness, emailSequencePerformance } = shadowFunnelData;

  const shadowKpis: KpiCardData[] = [
    { id: 'exit_intent_cr', title: 'Exit-Intent Popup CR', value: `${exitIntentPopup.rate}%`, change: `${exitIntentPopup.conversions.toLocaleString()} conv.`, icon: ZapIcon, tooltip: `${exitIntentPopup.conversions.toLocaleString()} conversions from ${exitIntentPopup.views.toLocaleString()} views.` },
    { id: 'abandoned_quiz_rec', title: 'Abandoned Quiz Recovery', value: `${abandonedQuizRecovery.rate}%`, change: `${abandonedQuizRecovery.recovered.toLocaleString()} recovered`, icon: ZapIcon, tooltip: `${abandonedQuizRecovery.recovered.toLocaleString()} quizzes recovered.` },
  ];


  return (
    <div className="space-y-6 md:space-y-8">
      <SectionWrapper title="Shadow Funnel Performance" actions={<ZapIcon className="w-5 h-5 text-orange-400"/>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {shadowKpis.map((kpi, index) => (
            <DataCard key={kpi.id} item={kpi} index={index}/>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper title="Retargeting Campaign Effectiveness">
        <ChartPlaceholder title="Conversions by Retargeting Campaign" height="h-72" message="Bar chart showing conversions attributed to different retargeting campaigns (e.g., Facebook, Google Ads)." />
        {/* <div className="mt-2 text-xs text-gray-500">Mock data: {JSON.stringify(retargetingEffectiveness)}</div> */}
      </SectionWrapper>

      <SectionWrapper title="Email Sequence Performance" actions={<MailIcon className="w-5 h-5 text-orange-400"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailSequencePerformance.map(seq => (
                <div key={seq.sequenceName} className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-2">{seq.sequenceName}</h4>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Open Rate:</span>
                        <span className="font-medium text-orange-300">{seq.openRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Click Rate:</span>
                        <span className="font-medium text-orange-300">{seq.clickRate}%</span>
                    </div>
                </div>
            ))}
        </div>
        <ChartPlaceholder title="Email Engagement Funnel (Overall)" height="h-64" message="Funnel chart for average email sequence performance (Opens > Clicks > Conversions)." className="mt-6"/>
      </SectionWrapper>
        <SectionWrapper title="Behavioral Scoring Insights (Conceptual)">
         <p className="text-gray-400 text-sm mb-3">
           This section would visualize the distribution of behavioral scores assigned to leads based on their interactions (e.g., quiz answers, content consumed, email engagement).
           Higher scores indicate higher intent or fit.
         </p>
         <ChartPlaceholder title="Lead Score Distribution" height="h-72" message="Histogram showing how many leads fall into different score buckets (e.g., Cold, Warm, Hot)." />
         <p className="text-xs text-gray-600 mt-2">Helps prioritize follow-ups and personalize communication for sales and marketing.</p>
      </SectionWrapper>
    </div>
  );
};

export default ShadowFunnelMetricsSection;
