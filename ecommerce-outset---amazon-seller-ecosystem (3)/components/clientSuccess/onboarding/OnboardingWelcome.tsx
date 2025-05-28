
import React from 'react';
import { motion } from 'framer-motion';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import { PlayCircleIcon } from '../../icons'; // Placeholder for video play icon
import { PERSONAS_DATA } from '../../../constants';

const OnboardingWelcome: React.FC = () => {
    const { clientName, clientPersonaId } = useClientSuccessStore();
    const persona = clientPersonaId ? PERSONAS_DATA.find(p => p.id === clientPersonaId) : null;
    const accentColorClass = persona ? persona.accentColorClass : 'text-orange-400';
    const borderColorClass = persona ? persona.borderColorClass : 'border-orange-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl border-t-4 ${borderColorClass}`}
        >
            <h1 className={`text-2xl md:text-3xl font-bold ${accentColorClass} mb-3`}>
                Welcome to Your Success Portal, {clientName}!
            </h1>
            <p className="text-gray-300 mb-6">
                We're thrilled to have you onboard! This portal is your central hub for everything related to the 
                <span className={`font-semibold ${accentColorClass}`}> {persona?.title || "Program"}</span>. 
                Let's get you started on the path to achieving your Amazon goals.
            </p>
            
            <div className="aspect-video bg-gray-700 rounded-md flex flex-col items-center justify-center text-center p-4 mb-6">
                <PlayCircleIcon className="w-16 h-16 text-gray-500 mb-2" />
                <p className="text-gray-400 font-semibold">Personalized Welcome Video from [Founder Name]</p>
                <p className="text-xs text-gray-500">(Video player placeholder)</p>
            </div>

            <p className="text-sm text-gray-400">
                Please complete the onboarding steps below to unlock the full potential of your program and tailor your experience.
            </p>
        </motion.div>
    );
};

export default OnboardingWelcome;
