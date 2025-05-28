
import React from 'react';
import { motion } from 'framer-motion';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import SectionWrapperClient from '../shared/SectionWrapperClient';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingChecklist from './OnboardingChecklist';
import DocumentCollection from './DocumentCollection';
import GoalSetting from './GoalSetting';
import CommunicationPreferences from './CommunicationPreferences';
import Button from '../../Button';
import { SparklesIcon } from '../../icons';
import { PERSONAS_DATA } from '../../../constants';

const OnboardingSection: React.FC = () => {
    const { 
        onboardingChecklist, 
        completeOnboardingStep,
        completeOnboarding,
        clientPersonaId,
        isOnboardingComplete
    } = useClientSuccessStore();

    const persona = clientPersonaId ? PERSONAS_DATA.find(p => p.id === clientPersonaId) : null;
    const accentColor = persona ? persona.accentColorClass.split('-')[1] + '-500' : 'orange-500'; // e.g. green-500

    const totalSteps = onboardingChecklist.reduce((acc, step) => acc + 1 + (step.subSteps?.length || 0), 0);
    const completedStepsCount = onboardingChecklist.reduce((acc, step) => {
        let count = 0;
        if (step.isCompleted) count++;
        if (step.subSteps) {
            count += step.subSteps.filter(s => s.isCompleted).length;
        }
        return acc + count;
    }, 0);
    const progressPercentage = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;

    if (isOnboardingComplete) {
        return (
            <SectionWrapperClient 
                title="Onboarding Complete!" 
                icon={SparklesIcon}
                accentColorClass={persona?.accentColorClass || 'text-orange-400'}
            >
                <p className="text-gray-300 mb-4">You've successfully completed all onboarding steps. You can now access your full client dashboard.</p>
                <Button onClick={() => useClientSuccessStore.getState().setActivePortalSection('dashboard')}>
                    Go to My Dashboard
                </Button>
            </SectionWrapperClient>
        );
    }

    return (
        <div className="space-y-8">
            <OnboardingWelcome />
            
            <SectionWrapperClient 
                title="Your Onboarding Journey" 
                icon={SparklesIcon} 
                accentColorClass={persona?.accentColorClass || 'text-orange-400'}
                description="Follow these steps to get fully set up and ready to maximize your success with our program."
            >
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>Progress</span>
                        <span>{completedStepsCount} / {totalSteps} Steps</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <motion.div
                            className={`h-2.5 rounded-full bg-${accentColor.replace('-500', '-400')}`}
                            initial={{ width: '0%'}}
                            animate={{ width: `${progressPercentage}%`}}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
                <OnboardingChecklist 
                    steps={onboardingChecklist} 
                    onToggleStep={completeOnboardingStep}
                    accentColorClass={accentColor}
                />
            </SectionWrapperClient>

            <GoalSetting accentColorClass={persona?.accentColorClass || 'text-orange-400'} />
            <DocumentCollection accentColorClass={persona?.accentColorClass || 'text-orange-400'} />
            <CommunicationPreferences accentColorClass={persona?.accentColorClass || 'text-orange-400'} />

            {progressPercentage === 100 && !isOnboardingComplete && (
                 <div className="text-center py-6">
                    <Button 
                        onClick={completeOnboarding} 
                        variant="primary" 
                        size="lg"
                        className={`!bg-${accentColor} hover:!bg-${accentColor.replace('500','600')}`}
                    >
                        Complete Onboarding & Access Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OnboardingSection;
