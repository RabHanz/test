
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import InteractiveToolStub from './shared/InteractiveToolStub';
import { LAUNCH_ROADMAP_STEPS } from '../../../constants';
import { trackLaunchHubEvent } from '../../../utils/trackingUtils'; // Updated Import
import { ClipboardListIcon, CheckCircleIcon } from '../../icons';

const LaunchSequenceRoadmapSection: React.FC = () => {
  // const { currentRoadmapStep, completeRoadmapStep } = useLaunchHubStore(); // For future dynamic tracking

  return (
    <SectionWrapper title="2. 60-Day Launch Sequence Roadmap" className="bg-gray-900 py-12 md:py-16" actions={<ClipboardListIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Follow our proven 60-day plan with daily tasks, weekly focus areas, and milestone celebrations to keep you on track for a successful launch.
      </p>

      <div className="mb-10">
        <InteractiveToolStub
            title="Interactive Launch Progress Tracker"
            description="Mark tasks as complete, see your progress, and get reminders for critical path items."
            ctaText="Open Tracker"
            onCtaClick={() => trackLaunchHubEvent('roadmap_tracker_opened')}
        />
      </div>

      <div className="space-y-8">
        {LAUNCH_ROADMAP_STEPS.map((step, index) => (
          <div key={step.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-green-300 mb-3">
              {step.title}
              {/* Example of showing completion - to be tied to store later */}
              {/* {index < 2 && <CheckCircleIcon className="w-5 h-5 inline-block ml-2 text-green-500" />} */}
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-400 list-disc list-inside pl-2">
              {step.tasks.map(task => <li key={task}>{task}</li>)}
            </ul>
            {/* Placeholder for milestone celebration trigger */}
            {/* {index === 1 && <p className="text-xs text-yellow-400 mt-2">Milestone Reached! Celebrate your Product Validation!</p>} */}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-8 text-center">
        Detailed daily tasks, critical path dependencies, and troubleshooting guides are available within the interactive tracker.
      </p>
    </SectionWrapper>
  );
};

export default LaunchSequenceRoadmapSection;
