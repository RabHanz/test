
import React, { useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useClientSuccessStore from '../../store/clientSuccessStore';
import type { ClientPortalSection, PersonaId } from '../../types';
import { PERSONAS_DATA } from '../../constants'; 
import { 
    UserCircleIcon, CollectionIcon, ChatAlt2Icon, PresentationChartLineIcon, CogIcon, SparklesIcon, TrendingUpIcon, SettingsIcon 
} from '../icons'; 

// Lazy load sections
const OnboardingSection = lazy(() => import('./onboarding/OnboardingSection'));
const ProgramDashboardSection = lazy(() => import('./programDashboards/ProgramDashboardSection'));
// Stubs for other sections
const CommunicationSectionStub = lazy(() => import('./communication/CommunicationSectionStub'));
const SuccessMetricsSectionStub = lazy(() => import('./successMetrics/SuccessMetricsSectionStub'));
const RetentionExpansionSectionStub = lazy(() => import('./retention/RetentionExpansionSectionStub'));
const ProfileSettingsSectionStub = lazy(() => import('./profile/ProfileSettingsSectionStub'));


const PORTAL_TABS: { id: ClientPortalSection; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'onboarding', label: 'Onboarding', Icon: SparklesIcon },
    { id: 'dashboard', label: 'Program Dashboard', Icon: CollectionIcon },
    { id: 'communication', label: 'Communication', Icon: ChatAlt2Icon },
    { id: 'success_metrics', label: 'Success Metrics', Icon: PresentationChartLineIcon },
    { id: 'retention_expansion', label: 'Growth & Next Steps', Icon: TrendingUpIcon }, 
    { id: 'profile_settings', label: 'Profile & Settings', Icon: SettingsIcon }, 
];

const ClientSuccessPlatform: React.FC = () => {
    const { 
        isLoading, 
        activePortalSection, 
        setActivePortalSection, 
        loadClientData, 
        clientName, 
        clientPersonaId,
        isOnboardingComplete 
    } = useClientSuccessStore();

    useEffect(() => {
        // Simulate fetching client data for 'launch' persona if not already loaded
        const assumedClientId = 'launch'; 
        if (!clientPersonaId && !isLoading) { // Check isLoading to prevent multiple calls
            loadClientData(assumedClientId as PersonaId);
        } else if (clientPersonaId) { // Only run redirection logic if personaId is loaded
            if (!isOnboardingComplete && activePortalSection !== 'onboarding') {
                setActivePortalSection('onboarding');
            } else if (isOnboardingComplete && activePortalSection === 'onboarding') {
                setActivePortalSection('dashboard');
            }
        }
    }, [loadClientData, clientPersonaId, isOnboardingComplete, activePortalSection, setActivePortalSection, isLoading]);


    const renderActiveSection = () => {
        if (isLoading && !clientPersonaId) { 
            return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><p className="text-xl text-gray-300">Loading your client portal...</p></div>;
        }
        
        // This check ensures redirection to onboarding if it's not complete.
        // If activePortalSection is already 'onboarding', it will render OnboardingSection.
        if (!isOnboardingComplete && activePortalSection !== 'onboarding') {
             // This state should ideally be handled by the useEffect, but as a fallback:
            return <Suspense fallback={<div>Loading Onboarding...</div>}><OnboardingSection /></Suspense>;
        }


        switch (activePortalSection) {
            case 'onboarding':
                return <Suspense fallback={<div>Loading Onboarding...</div>}><OnboardingSection /></Suspense>;
            case 'dashboard':
                return <Suspense fallback={<div>Loading Dashboard...</div>}><ProgramDashboardSection /></Suspense>;
            case 'communication':
                return <Suspense fallback={<div>Loading Communication...</div>}><CommunicationSectionStub /></Suspense>;
            case 'success_metrics':
                return <Suspense fallback={<div>Loading Metrics...</div>}><SuccessMetricsSectionStub /></Suspense>;
            case 'retention_expansion':
                return <Suspense fallback={<div>Loading Growth Hub...</div>}><RetentionExpansionSectionStub /></Suspense>;
            case 'profile_settings':
                return <Suspense fallback={<div>Loading Settings...</div>}><ProfileSettingsSectionStub /></Suspense>;
            default:
                // Fallback to dashboard if onboarding is complete, otherwise onboarding
                return isOnboardingComplete 
                    ? <Suspense fallback={<div>Loading Dashboard...</div>}><ProgramDashboardSection /></Suspense>
                    : <Suspense fallback={<div>Loading Onboarding...</div>}><OnboardingSection /></Suspense>;
        }
    };
    
    const personaDetails = clientPersonaId ? PERSONAS_DATA.find(p=>p.id === clientPersonaId) : null;
    const personaColorClass = personaDetails?.accentColorClass || 'text-orange-400'; // Full class e.g. text-green-400
    const accentColorName = personaDetails ? personaDetails.accentColorClass.split('-')[1] : 'orange'; // e.g. green


    const pageTransition = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.3, ease: "easeInOut" }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-900 text-gray-100 md:pt-8"
        >
            <div className="container mx-auto px-0 sm:px-4 lg:px-0">
                <header className="bg-gray-800 shadow-md p-4 sm:rounded-t-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                        <div className="flex items-center">
                            <UserCircleIcon className={`w-10 h-10 sm:w-12 sm:h-12 mr-3 ${personaColorClass}`} />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">Client Portal</h1>
                                <p className="text-xs sm:text-sm text-gray-400">Welcome back, {clientName}!</p>
                            </div>
                        </div>
                         <div className="text-xs sm:text-sm text-gray-300">
                            Program: <span className={`font-semibold ${personaColorClass}`}>{personaDetails?.title || 'N/A'}</span>
                        </div>
                    </div>
                </header>

                <div className="bg-gray-800 sm:bg-transparent">
                    <nav className="flex space-x-1 border-b border-gray-700 no-scrollbar overflow-x-auto px-2 sm:px-0" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                        {PORTAL_TABS.filter(tab => {
                            if (isOnboardingComplete) return true;
                            return tab.id === 'onboarding';
                        }).map((tab) => {
                            const isActive = activePortalSection === tab.id;
                            const baseButtonClasses = 'flex items-center whitespace-nowrap py-2 px-3 md:px-4 font-medium text-xs md:text-sm transition-colors duration-200 ease-in-out focus:outline-none';
                            // Example: accentColorName = 'green', activeStateClasses uses border-green-400 and text-green-400
                            const activeStateClasses = `border-b-2 border-${accentColorName}-400 ${personaColorClass}`;
                            const inactiveStateClasses = 'text-gray-400 hover:text-gray-100 border-b-2 border-transparent hover:border-gray-600';
                            const finalClassName = `${baseButtonClasses} ${isActive ? activeStateClasses : inactiveStateClasses}`;
                            const iconColorClass = isActive ? personaColorClass : 'text-gray-500';


                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActivePortalSection(tab.id)}
                                    className={finalClassName}
                                >
                                    <tab.Icon className={`w-4 h-4 mr-1.5 flex-shrink-0 ${iconColorClass}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePortalSection}
                        initial={pageTransition.initial}
                        animate={pageTransition.animate}
                        exit={pageTransition.exit}
                        transition={pageTransition.transition}
                        className="flex-grow p-3 sm:p-4 md:p-6"
                    >
                        {renderActiveSection()}
                    </motion.div>
                </AnimatePresence>
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </motion.div>
    );
};

export default ClientSuccessPlatform;
