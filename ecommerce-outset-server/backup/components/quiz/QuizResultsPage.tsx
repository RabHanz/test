
import React from 'react';
import { motion } from 'framer-motion';
import type { QuizResult, Persona as PersonaType } from '../../types';
import { PERSONAS_DATA } from '../../constants';
import { trackCTAClick } from '../../utils/trackingUtils'; // Updated Import
import Button from '../Button';
import { LaunchIcon, ScaleIcon, MasterIcon, InvestIcon, ConnectIcon } from '../icons'; // Default icons

interface QuizResultsPageProps {
  result: QuizResult;
  onRetake: () => void;
  onClose: () => void;
  quizTitleId?: string; // For aria-labelledby on the section
}

const PersonaDisplay: React.FC<{ persona: PersonaType, isPrimary: boolean }> = ({ persona, isPrimary }) => {
  const PersonaIconComponent = persona.Icon || LaunchIcon; // Fallback Icon
  const personaTitleId = `persona-title-${persona.id}`;

  return (
    <motion.div
      className={`p-6 rounded-xl border-2 ${isPrimary ? `${persona.borderColorClass} bg-gray-700 shadow-xl ${persona.shadowColorClass}` : 'border-gray-600 bg-gray-750'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: isPrimary ? 0.2 : 0.5 }}
      role="article"
      aria-labelledby={personaTitleId}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
        <PersonaIconComponent className={`w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 ${persona.accentColorClass}`} aria-hidden="true" />
        <div>
          <h3 id={personaTitleId} className={`text-2xl sm:text-3xl font-bold ${persona.accentColorClass} mb-2`}>
            {isPrimary ? "Your Primary Persona:" : "Also aligns with:"} {persona.title}
          </h3>
          {isPrimary && persona.memberCount && <p className="text-sm text-orange-300 mb-2 font-semibold">{persona.memberCount}</p>}
          <p className="text-gray-300 text-sm mb-3">{persona.longDescription || persona.description}</p>
        </div>
      </div>

      {isPrimary && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Your Amazon Journey Roadmap:</h4>
          <ul className="space-y-2 text-sm list-disc list-inside text-gray-300 pl-2">
            <li>Explore your <a href={persona.ctaHref} className={`font-medium ${persona.accentColorClass} hover:underline`}>Personalized Content Pathway</a>.</li>
            <li>Download your <a href={persona.recommendedResources?.[0]?.link || '#'} className={`font-medium ${persona.accentColorClass} hover:underline`}>{persona.recommendedResources?.[0]?.title || 'starter resource'}</a>.</li>
            <li>Consider the <a href={persona.serviceTierPreview?.[0]?.cta || '#'} className={`font-medium ${persona.accentColorClass} hover:underline`}>{persona.serviceTierPreview?.[0]?.name || 'recommended service'}</a> for accelerated growth.</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};


const QuizResultsPage: React.FC<QuizResultsPageProps> = ({ result, onRetake, onClose, quizTitleId }) => {
  const { primaryPersona, secondaryPersonas, allScores } = result;
  const resultsTitleId = quizTitleId || "quiz-results-heading";

  if (!primaryPersona) {
    const unknownPersona = PERSONAS_DATA.find(p => p.id === 'unknown') || {
        id: 'unknown', Icon: ConnectIcon, title: "Let's Chat!",
        longDescription: "Your answers show a unique mix! Let's have a quick chat to find the best path for you.",
        accentColorClass: "text-gray-400", borderColorClass: "border-gray-500", ctaHref: "#contact",
        memberCount: "", description: "", ctaText: "", buttonColorClass: "bg-gray-500"
    };
    return (
      <div className="p-4 md:p-8 text-center flex flex-col justify-center items-center h-full" aria-labelledby={resultsTitleId}>
        <h2 id={resultsTitleId} className="text-2xl font-bold text-white mb-4">Interesting Profile!</h2>
        <PersonaDisplay persona={unknownPersona as PersonaType} isPrimary={true} />
        <p className="text-gray-300 my-6">We'd love to help you find the perfect fit in the EO ecosystem.</p>
        <Button type="button" variant="primary" onClick={() => { trackCTAClick('Results Contact Us'); window.location.href = '#contact'; onClose(); }} className="mb-4">
          Contact Us for Guidance
        </Button>
        <Button type="button" variant="secondary" onClick={onRetake}>Retake Quiz</Button>
      </div>
    );
  }

  const primaryPersonaDetails = PERSONAS_DATA.find(p => p.id === primaryPersona.id);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 h-full overflow-y-auto" aria-labelledby={resultsTitleId}>
      <div className="text-center">
        <h2 id={resultsTitleId} className="text-3xl md:text-4xl font-extrabold text-white mb-2">Your Personalized Results!</h2>
        <p className="text-gray-300 mb-6">Here's what your answers tell us about your Amazon journey:</p>
      </div>

      {primaryPersonaDetails && <PersonaDisplay persona={primaryPersonaDetails} isPrimary={true} />}

      {secondaryPersonas && secondaryPersonas.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold text-white mb-4 text-center">You also show traits of:</h4>
          <div className="space-y-4">
            {secondaryPersonas.map(sp => {
              const spDetails = PERSONAS_DATA.find(p => p.id === sp.id);
              return spDetails ? <PersonaDisplay key={sp.id} persona={spDetails} isPrimary={false} /> : null;
            })}
          </div>
        </div>
      )}

      <div className="mt-8 text-center space-y-4 py-6 border-t border-gray-700">
         <h4 className="text-xl font-semibold text-white mb-3">Next Steps:</h4>
         <Button
            type="button"
            variant="custom"
            customColorClass={primaryPersonaDetails?.buttonColorClass || 'bg-orange-500 hover:bg-orange-600'}
            size="lg"
            onClick={() => {
              trackCTAClick(`Results Book Strategy Session - ${primaryPersona.title}`);
              window.open(primaryPersonaDetails?.strategySessionLink || '#book-consult', '_blank');
              onClose();
            }}
            className="w-full max-w-xs mx-auto"
        >
            Book a FREE Strategy Session
        </Button>
        <Button type="button" variant="secondary" onClick={onRetake} className="w-full max-w-xs mx-auto">Retake Quiz</Button>
        <Button type="button" variant="link" onClick={onClose} className="text-gray-400 hover:text-orange-400 w-full max-w-xs mx-auto !mt-2">Close</Button>
      </div>

      {/* Optional: Display all scores for transparency or debugging */}
      {/* <details className="text-xs text-gray-500 mt-6">
        <summary>View Detailed Score Breakdown</summary>
        <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(allScores, null, 2)}</pre>
      </details> */}
    </div>
  );
};

export default QuizResultsPage;
