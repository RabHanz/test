import React from 'react';
import useAnalyticsStore from '../../store/analyticsStore';
import SectionWrapper from './shared/SectionWrapper';
import ChartPlaceholder from './shared/ChartPlaceholder';
import { UsersIcon } from '../icons';

const PersonaAnalyticsSection: React.FC = () => {
  const { personaAnalyticsData } = useAnalyticsStore();

  if (!personaAnalyticsData) {
    return <div className="text-center p-8 text-gray-300">Loading persona analytics data...</div>;
  }
  
  const { distribution, quizCompletionRates, confidenceScores } = personaAnalyticsData;

  return (
    <div className="space-y-6 md:space-y-8">
      <SectionWrapper title="Persona Visitor Distribution" actions={<UsersIcon className="w-5 h-5 text-orange-400"/>}>
        <ChartPlaceholder title="Visitors by Persona" height="h-80" message="Bar or Pie chart showing visitor counts for each persona."/>
        {/* <div className="mt-2 text-xs text-gray-500">Mock data: {JSON.stringify(distribution)}</div> */}
      </SectionWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionWrapper title="Quiz Completion Rates by Source">
          <ChartPlaceholder title="Quiz Completion %" height="h-64" message="Bar chart comparing completion rates from different traffic sources."/>
          <div className="mt-4 space-y-1.5">
            {quizCompletionRates.map(item => (
              <div key={item.source} className="text-xs flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">{item.source}:</span>
                <span className="font-semibold text-orange-300">{item.rate}%</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
        <SectionWrapper title="Persona Confidence Scores">
           <ChartPlaceholder title="Confidence Score Distribution" height="h-64" message="Histogram showing distribution of persona confidence scores from quiz."/>
           {/* <div className="mt-2 text-xs text-gray-500">Mock data: {JSON.stringify(confidenceScores)}</div> */}
        </SectionWrapper>
      </div>
      
       <SectionWrapper title="Cross-Persona Journey Mapping (Conceptual)">
         <p className="text-gray-400 text-sm mb-3">
           This area would visualize how users transition between personas or interact with content designed for different personas, indicating evolving needs or interests.
         </p>
         <ChartPlaceholder title="Journey Flow Diagram" height="h-80" message="Sankey or flow diagram illustrating user journeys across persona-specific content." />
         <p className="text-xs text-gray-600 mt-2">Advanced feature requiring deep event tracking and content tagging by persona.</p>
      </SectionWrapper>
    </div>
  );
};

export default PersonaAnalyticsSection;
