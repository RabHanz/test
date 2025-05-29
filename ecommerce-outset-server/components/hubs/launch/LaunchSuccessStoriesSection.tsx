import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { LAUNCH_SUCCESS_STORIES } from '../../../constants';
import { SparklesIcon, PlayCircleIcon } from '../../icons';

const LaunchSuccessStoriesSection: React.FC = () => {
  return (
    <SectionWrapper title="Launch Success Stories" className="bg-gray-850 py-12 md:py-16" actions={<SparklesIcon className="w-6 h-6 text-green-400"/>}>
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        See how beginners just like you have used the EO Launch PathFinder System to achieve their Amazon goals.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {LAUNCH_SUCCESS_STORIES.map(story => (
          <div key={story.id} className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 hover:shadow-green-500/20 transition-shadow duration-300">
            <h3 className="text-2xl font-bold text-white mb-3">{story.name}'s Journey</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1"><strong className="text-green-300">Before:</strong> {story.before}</p>
              <p className="text-sm text-gray-400"><strong className="text-green-300">After:</strong> {story.after}</p>
            </div>
            <p className="font-semibold text-green-400 text-lg mb-4">{story.result}</p>
            {story.videoUrl && (
              <a 
                href={story.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors"
                onClick={() => console.log(`Track video click: ${story.name}`)}
              >
                <PlayCircleIcon className="w-5 h-5 mr-2"/> Watch Testimonial
              </a>
            )}
            {/* Placeholder for timeline/challenge documentation */}
            {/* <p className="text-xs text-gray-500 mt-3">Full launch timeline & challenges overcome available in member area.</p> */}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default LaunchSuccessStoriesSection;
