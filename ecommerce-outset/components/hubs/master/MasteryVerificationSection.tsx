
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { MASTER_VERIFICATION_METHODS } from '../../../constants';
import { trackMasterHubEvent } from '../../../utils/trackingUtils';
import { CheckCircleIcon } from '../../icons'; // Using general checkmark for verification
import Button from '../../Button';

const MasteryVerificationSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="5. Mastery Verification & Certification" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<CheckCircleIcon className="w-6 h-6 text-purple-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Validate your understanding and practical application skills. Our verification system includes domain-specific assessments, scenario testing, peer teaching, expert evaluations, and a pathway to EO Master Certification.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MASTER_VERIFICATION_METHODS.map(method => (
          <div key={method.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700/30 flex flex-col">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">{method.name}</h3>
            <p className="text-xs text-purple-200 mb-1 uppercase">{method.type}</p>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{method.description}</p>
            <Button 
                variant='secondary' 
                size='sm' 
                className='w-full mt-auto !bg-purple-600 hover:!bg-purple-700'
                onClick={() => trackMasterHubEvent('mastery_method_details_clicked', {method_name: method.name})}
            >
                Learn More
            </Button>
          </div>
        ))}
      </div>
       <div className="text-center mt-10">
        <Button 
            variant="primary" 
            size="lg" 
            onClick={() => {
                trackMasterHubEvent('certification_path_clicked');
                // Link to certification info page/section
            }}
            className="!bg-purple-500 hover:!bg-purple-600 focus:!ring-purple-400"
        >
            Explore Certification Pathway
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default MasteryVerificationSection;