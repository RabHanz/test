
import React, { Suspense, lazy } from 'react';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import SectionWrapperClient from '../shared/SectionWrapperClient';
import { CollectionIcon } from '../../icons'; // Main dashboard icon
import { PERSONAS_DATA } from '../../../constants';

// Lazy load specific persona dashboards
const LaunchProgramDashboard = lazy(() => import('./LaunchProgramDashboard'));
const ScaleProgramDashboardStub = lazy(() => import('./ScaleProgramDashboardStub'));
const MasterProgramDashboardStub = lazy(() => import('./MasterProgramDashboardStub'));
const InvestProgramDashboardStub = lazy(() => import('./InvestProgramDashboardStub'));
const ConnectProgramDashboardStub = lazy(() => import('./ConnectProgramDashboardStub'));


const ProgramDashboardSection: React.FC = () => {
    const { clientPersonaId, currentProgramData, isLoading } = useClientSuccessStore();

    const personaDetails = clientPersonaId ? PERSONAS_DATA.find(p => p.id === clientPersonaId) : null;
    const accentColorClass = personaDetails?.accentColorClass || 'text-orange-400';
    const programTitle = personaDetails ? `${personaDetails.title} Program Dashboard` : "Program Dashboard";

    const renderSpecificDashboard = () => {
        if (isLoading || !currentProgramData) {
            return <div className="text-center p-10 text-gray-400">Loading your program data...</div>;
        }

        switch (clientPersonaId) {
            case 'launch':
                return <Suspense fallback={<div>Loading Launch Dashboard...</div>}><LaunchProgramDashboard /></Suspense>;
            case 'scale':
                 return <Suspense fallback={<div>Loading Scale Dashboard...</div>}><ScaleProgramDashboardStub /></Suspense>;
            case 'master':
                 return <Suspense fallback={<div>Loading Master Dashboard...</div>}><MasterProgramDashboardStub /></Suspense>;
            case 'invest':
                 return <Suspense fallback={<div>Loading Invest Dashboard...</div>}><InvestProgramDashboardStub /></Suspense>;
            case 'connect':
                 return <Suspense fallback={<div>Loading Connect Dashboard...</div>}><ConnectProgramDashboardStub /></Suspense>;
            default:
                return <p className="text-gray-400 text-center">Your program dashboard will appear here once your program is fully active.</p>;
        }
    };

    return (
        <SectionWrapperClient 
            title={programTitle}
            icon={CollectionIcon}
            accentColorClass={accentColorClass}
            description="This is your central hub for program materials, task management, progress tracking, and direct communication with your coach."
            className="!p-0 sm:!p-0 md:!p-0" // Remove padding if sub-components handle it
        >
           <div className="bg-gray-850 p-4 md:p-6 rounded-b-xl"> {/* Add padding back here if needed for content */}
             {renderSpecificDashboard()}
           </div>
        </SectionWrapperClient>
    );
};

export default ProgramDashboardSection;
