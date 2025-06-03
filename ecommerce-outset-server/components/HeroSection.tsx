import React from 'react';

interface HeroSectionProps {
  headlineVariant: string;
  ctaVariant: {
    text: string;
    actionType: string;
    variant?: string;
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ headlineVariant, ctaVariant }) => {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold">{headlineVariant}</h1>
        <p className="mt-4 text-lg">{ctaVariant.text}</p>
        <button 
          className="mt-6 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          onClick={() => {
            // Handle CTA action based on ctaVariant.actionType
            console.log('CTA clicked:', ctaVariant.actionType);
          }}
        >
          {ctaVariant.text}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
