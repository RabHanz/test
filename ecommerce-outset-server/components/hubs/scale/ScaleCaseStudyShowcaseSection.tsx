
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { SCALE_CASE_STUDIES } from '../../../constants';
// import { trackScaleHubEvent } from '../../../utils/trackingUtils'; // Not used in this component currently
import { SparklesIcon, CheckCircleIcon } from '../../icons'; // Reusing SparklesIcon

const ScaleCaseStudyShowcaseSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Scaling Success Stories" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<SparklesIcon className="w-6 h-6 text-blue-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Discover how established sellers transformed their businesses, overcame plateaus, and achieved significant growth using the EO ScaleFinder Frameworks.
      </p>
      <div className="space-y-12">
        {SCALE_CASE_STUDIES.map(study => (
          <div key={study.id} className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl border border-blue-700 hover:shadow-blue-500/30 transition-shadow duration-300">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-300 mb-4">{study.clientName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-md font-semibold text-white mb-1">The Challenge:</h4>
                <p className="text-sm text-gray-400">{study.challenge}</p>
              </div>
              <div>
                <h4 className="text-md font-semibold text-white mb-1">Solution Applied:</h4>
                <p className="text-sm text-gray-400">{study.solutionApplied}</p>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-white mb-3">Key Results:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {study.results.map(result => (
                <div key={result.metric} className="bg-blue-700/30 p-3 rounded-md">
                  <p className="text-xs text-blue-200">{result.metric}</p>
                  <p className="text-xl font-bold text-white">{result.value}</p>
                  {result.improvement && <p className="text-xs text-green-300">({result.improvement})</p>}
                </div>
              ))}
            </div>
            {study.testimonialQuote && (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-700/50 rounded-r-md">
                <p className="text-sm italic text-gray-300">"{study.testimonialQuote}"</p>
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ScaleCaseStudyShowcaseSection;