
import React from 'react';
import useVisitorStore from '../../store/visitorStore';

const LeadInfoDisplay: React.FC = () => {
  const { leadScore, leadStage, determinedPersonaId, engagementScore, engagementLevel, isEmailSubscriber, serviceInquiryState } = useVisitorStore(state => ({
    leadScore: state.leadScore,
    leadStage: state.leadStage,
    determinedPersonaId: state.determinedPersonaId,
    engagementScore: state.engagementScore,
    engagementLevel: state.engagementLevel,
    isEmailSubscriber: state.isEmailSubscriber,
    serviceInquiryState: state.serviceInquiryState,
  }));

  const scoreDetail = (label: string, value: number | undefined, subMetrics?: Record<string, number | undefined>) => (
    <div className="mb-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}:</span>
        <span className="font-medium text-gray-200">{value === undefined ? 'N/A' : value.toFixed(0)}</span>
      </div>
      {subMetrics && (
        <div className="pl-2 text-xxs text-gray-500">
          {Object.entries(subMetrics).map(([key, val]) => {
            if (key !== 'currentTotal' && val !== undefined && val > 0) {
              return <div key={key}>{`${key}: ${val.toFixed(0)}`}</div>;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );

  const otherInfo = (label: string, value: string | number | boolean | null | undefined) => (
     <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-200 truncate" title={String(value)}>{String(value)}</span>
    </div>
  );

  return (
    <div
      className="fixed bottom-4 right-4 bg-gray-800 bg-opacity-90 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-lg p-3 w-72 z-[200] text-white text-xs"
      role="status"
      aria-live="polite"
    >
      <h3 className="text-sm font-semibold text-orange-400 mb-1.5 border-b border-gray-700 pb-1">
        Dev: Lead Status
      </h3>
      <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
        {scoreDetail("Behavioral Score", leadScore.behavioralScore?.currentTotal, leadScore.behavioralScore)}
        {scoreDetail("Demographic Score", leadScore.demographicScore?.currentTotal, leadScore.demographicScore)}
        {scoreDetail("Engagement Quality", leadScore.engagementQualityScore?.currentTotal, leadScore.engagementQualityScore)}
        
        <div className="flex justify-between text-sm pt-1 mt-1 border-t border-gray-600">
          <span className="text-gray-300 font-semibold">Total Lead Score:</span>
          <span className="font-bold text-orange-300">{leadScore.totalScore?.toFixed(0) || '0'}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300 font-semibold">Lead Stage:</span>
          <span className="font-bold text-orange-300">{leadStage}</span>
        </div>
        <div className="pt-1 mt-1 border-t border-gray-700 space-y-0.5">
            {otherInfo("Persona ID", determinedPersonaId)}
            {otherInfo("Engagement (Site)", `${engagementScore.toFixed(0)} (${engagementLevel})`)}
            {otherInfo("Email Subscriber", isEmailSubscriber)}
            {otherInfo("Service Inquiry", serviceInquiryState)}
        </div>

      </div>
       <button 
        onClick={() => useVisitorStore.getState().resetVisitorProfile()}
        className="mt-2 text-xs bg-red-700 hover:bg-red-600 text-white py-1 px-2 rounded w-full transition-colors"
      >
        Reset Visitor Profile
      </button>
      <style>{`
        .text-xxs {
          font-size: 0.65rem; /* 10.4px */
          line-height: 0.9rem;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4B5563; /* bg-gray-600 */
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default LeadInfoDisplay;
