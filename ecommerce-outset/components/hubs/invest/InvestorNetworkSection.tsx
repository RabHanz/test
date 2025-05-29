
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import Button from '../../Button';
import { INVEST_NETWORK_FEATURES } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { UsersGroupIcon } from '../../icons'; 

const InvestorNetworkSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Exclusive Investor Network" 
      className="bg-gray-900 py-12 md:py-16" 
      actions={<UsersGroupIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Connect with a curated community of Amazon business investors. Share deals, collaborate on due diligence, access expert advice, and gain valuable market intelligence.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {INVEST_NETWORK_FEATURES.map(feature => (
          <div key={feature.id} className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-yellow-700/50 h-full flex flex-col">
            <UsersGroupIcon className="w-8 h-8 text-yellow-400 mx-auto mb-3"/>
            <h3 className="text-lg font-semibold text-yellow-300 mb-2">{feature.name}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{feature.description}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="!bg-yellow-600 hover:!bg-yellow-700 text-white mt-auto"
              onClick={() => {
                trackInvestHubEvent('investor_network_feature_clicked', { feature_name: feature.name });
                alert(`Placeholder: Learn more about ${feature.name}`);
              }}
            >
              Explore Feature
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button 
          variant="primary" 
          size="lg"
           className="!bg-yellow-500 hover:!bg-yellow-600 text-gray-900 focus:!ring-yellow-400"
          onClick={() => {
            trackInvestHubEvent('join_investor_network_clicked');
            alert("Placeholder: Redirect to Investor Network Application or Info Page");
          }}
        >
          Apply to Join the Investor Network
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default InvestorNetworkSection;