
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { INVEST_DUE_DILIGENCE_ITEMS } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { BriefcaseIcon, CheckCircleIcon } from '../../icons'; // Reusing BriefcaseIcon
import Button from '../../Button';

const DueDiligenceSystemSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="1. Due Diligence System" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<BriefcaseIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Our 15-point Amazon business evaluation framework provides a systematic approach to vet opportunities, identify red flags, and make informed investment decisions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {INVEST_DUE_DILIGENCE_ITEMS.map(item => (
          <div key={item.id} className="bg-gray-800 p-5 rounded-lg shadow-lg border border-yellow-700/30">
            <h3 className="text-md font-semibold text-yellow-300 mb-1">{item.name}</h3>
            <p className="text-xs text-yellow-200 mb-2 uppercase">{item.category}</p>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button 
            variant="custom"
            customColorClass="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
            size="md"
            onClick={() => {
                trackInvestHubEvent('download_dd_checklist_clicked');
                alert("Placeholder: Download Comprehensive DD Checklist PDF");
            }}
        >
            <CheckCircleIcon className="w-5 h-5 mr-2"/> Download Full Checklist
        </Button>
      </div>
       <p className="text-xs text-gray-500 mt-4 text-center">Includes financial analysis templates, operational assessment tools, and market positioning worksheets.</p>
    </SectionWrapper>
  );
};

export default DueDiligenceSystemSection;