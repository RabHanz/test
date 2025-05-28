
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { MASTER_KNOWLEDGE_DOMAINS } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { CheckCircleIcon, ClipboardListIcon } from '../../icons'; // Reusing some icons
import LearningModuleStub from './shared/LearningModuleStub';

const KnowledgeProgressionTrackingSection: React.FC = () => {
  // Example progress - in real app, this would come from masterHubStore
  const completedDomains = 3;
  const totalDomains = MASTER_KNOWLEDGE_DOMAINS.length;
  const progressPercentage = (completedDomains / totalDomains) * 100;

  return (
    <SectionWrapper 
      title="4. Knowledge Progression Tracking" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<ClipboardListIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Track your mastery across 9 key Amazon domains. Our system helps you identify knowledge gaps, customize your learning path, and unlock advanced topics as you progress.
      </p>
      
      <div className="mb-10">
        <LearningModuleStub
            title="Personalized Learning Dashboard"
            description="View your competency assessments, track progress through modules, visualize milestones, and get recommendations for your next learning steps."
            ctaText="View My Dashboard"
            onCtaClick={() => trackMasterHubEvent('learning_dashboard_viewed')}
            accentColorClass="purple"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-2 text-center">9 Core Knowledge Domains:</h3>
        <p className="text-sm text-gray-400 mb-6 text-center">Assessments available for domains marked with <CheckCircleIcon className="w-4 h-4 inline text-green-400"/>.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MASTER_KNOWLEDGE_DOMAINS.map(domain => (
            <div key={domain.id} className="bg-gray-800 p-4 rounded-md shadow">
              <h4 className="text-sm font-semibold text-purple-300 flex items-center">
                {domain.name}
                {domain.assessmentAvailable && <CheckCircleIcon className="w-4 h-4 ml-2 text-green-400 flex-shrink-0" title="Assessment Available"/>}
              </h4>
              {/* <p className="text-xs text-gray-500">{domain.description}</p> */}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-sm text-purple-200 mb-1 text-center">Overall Progress Example:</p>
          <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-purple-500 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">{completedDomains} of {totalDomains} core domains initiated.</p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default KnowledgeProgressionTrackingSection;