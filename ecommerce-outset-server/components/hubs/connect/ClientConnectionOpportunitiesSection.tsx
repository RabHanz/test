
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import { CONNECT_OPPORTUNITIES } from '../../../constants';
import { trackConnectHubEvent } from '../../../utils/trackingUtils';
import { HandshakeIcon } from '../../icons';
import Button from '../../Button';

const ClientConnectionOpportunitiesSection: React.FC = () => {
  return (
    <SectionWrapper 
      title="Client Connection Opportunities" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<HandshakeIcon className="w-6 h-6 text-teal-400"/>}
    >
      <p className="text-gray-300 mb-10 text-center max-w-2xl mx-auto">
        Tap into the EO ecosystem to find qualified clients and collaborative projects. Our platform facilitates meaningful connections between service providers and Amazon sellers.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CONNECT_OPPORTUNITIES.map(opp => (
          <div key={opp.id} className="bg-gray-800 p-6 rounded-xl shadow-xl border border-teal-700/40 transform hover:shadow-teal-500/30 transition-shadow duration-300">
            <h3 className="text-xl font-bold text-teal-300 mb-2">{opp.type}</h3>
            <p className="text-sm text-gray-400 mb-4">{opp.description}</p>
            <Button 
              variant="custom"
              customColorClass="bg-teal-500 hover:bg-teal-600"
              size="sm" 
              onClick={() => trackConnectHubEvent('connection_opportunity_clicked', { opportunity_type: opp.type })}
            >
              {opp.ctaText}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-8 text-center">
        Full access to client matching, service requests, and the provider directory is available to active EO Connect members.
      </p>
    </SectionWrapper>
  );
};

export default ClientConnectionOpportunitiesSection;