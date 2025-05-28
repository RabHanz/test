
import React from 'react';
import { motion } from 'framer-motion';
import { PERSONAS_DATA } from '../constants';
import { trackPersonaCardClick } from '../utils/trackingUtils'; // Updated Import
import type { Persona } from '../types';
import Button from './Button';

const PersonaCard: React.FC<{ persona: Persona, index: number }> = ({ persona, index }) => {
  const { Icon, title, description, memberCount, ctaText, ctaHref, accentColorClass, borderColorClass, buttonColorClass, shadowColorClass } = persona;

  return (
    <motion.div
      className={`bg-gray-800 rounded-xl p-6 border-2 ${borderColorClass} border-opacity-50 flex flex-col items-center text-center transform transition-all duration-300 ease-in-out shadow-lg ${shadowColorClass || 'hover:shadow-gray-700/50'}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.03, boxShadow: `0 20px 25px -5px rgba(0,0,0,0.1), 0 0px 10px -5px ${shadowColorClass ? 'var(--tw-shadow-color)' : 'rgba(107,114,128,0.5)'}`}}
    >
      <Icon className={`w-16 h-16 mb-4 ${accentColorClass}`} />
      <h3 className={`text-2xl font-bold mb-2 ${accentColorClass}`}>{title}</h3>
      <p className="text-gray-300 text-sm mb-3 h-10">{description}</p>
      <p className="text-xs text-gray-400 mb-5">{memberCount}</p>
      <Button
        variant="custom"
        customColorClass={buttonColorClass}
        size="sm"
        onClick={() => {
          trackPersonaCardClick(title);
          window.location.href = ctaHref;
        }}
        className="w-full mt-auto"
      >
        {ctaText}
      </Button>
    </motion.div>
  );
};

const PersonaSection: React.FC = () => {
  return (
    <section id="pathways" className="py-16 sm:py-24 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y:20 }}
          whileInView={{ opacity: 1, y:0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-4">
            Find Your Personalized Path
          </h2>
          <p className="text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Ecommerce Outset is designed for every stage of the Amazon seller journey. Select your current focus to get started.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
          {PERSONAS_DATA.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonaSection;
