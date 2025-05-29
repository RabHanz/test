
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { MASTER_CONCEPTUAL_FRAMEWORKS } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { BookOpenIcon } from '../../icons';
import Button from '../../Button';

const ConceptualFrameworkLibrarySection: React.FC = () => {
  return (
    <SectionWrapper 
      title="2. Conceptual Framework Library" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<BookOpenIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Access our comprehensive database of core Amazon selling principles and mental models. Each framework includes visual representations, cross-references, and practical application scenarios.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MASTER_CONCEPTUAL_FRAMEWORKS.map(framework => (
          <div key={framework.id} className="bg-gray-800 p-6 rounded-xl shadow-xl border border-purple-700/50 flex flex-col">
            <h3 className="text-xl font-bold text-purple-300 mb-3">{framework.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{framework.summary}</p>
            
            {framework.visualModelUrl && (
              <div className="mb-4">
                <img src={framework.visualModelUrl} alt={`${framework.name} Model`} className="rounded-md border border-gray-700" />
                <p className="text-xs text-gray-500 text-center mt-1">Visual Model Example</p>
              </div>
            )}

            <h5 className="text-xs font-semibold text-gray-200 mb-1 mt-auto">Application Scenarios:</h5>
            <ul className="text-xs text-gray-400 list-disc list-inside pl-1 space-y-0.5 mb-4">
              {framework.applicationScenarios.map(scenario => <li key={scenario}>{scenario}</li>)}
            </ul>
            <Button 
                variant='secondary' 
                size='sm' 
                className='w-full !bg-purple-600 hover:!bg-purple-700'
                onClick={() => trackMasterHubEvent('framework_details_clicked', {framework_name: framework.name})}
            >
                View Full Framework
            </Button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ConceptualFrameworkLibrarySection;