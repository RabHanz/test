
import React, { useEffect, useState, useMemo } from 'react';
import { motion, animate } from 'framer-motion';
import { TESTIMONIALS_DATA, SOCIAL_PROOF_METRICS } from '../constants';
import type { Testimonial, Stat, PersonaId } from '../types';
import useVisitorStore from '../store/visitorStore';

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ to, duration = 2, suffix = '', prefix = '', className = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]);

  return (
    <span className={`font-bold ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial, index: number }> = ({ testimonial, index }) => {
  return (
    <motion.div 
      className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="flex items-center mb-4">
        <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full mr-4 border-2 border-orange-500"/>
        <div>
          <h4 className="font-semibold text-lg text-white">{testimonial.name}</h4>
          <p className="text-sm text-orange-400">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-4 flex-grow">"{testimonial.text}"</p>
      <p className="font-semibold text-green-400 mt-auto">{testimonial.result}</p>
    </motion.div>
  );
};

const SocialProofSection: React.FC = () => {
  const determinedPersonaId = useVisitorStore(state => state.determinedPersonaId);

  const displayedTestimonials = useMemo(() => {
    if (determinedPersonaId && determinedPersonaId !== 'unknown') {
      const personaTestimonials = TESTIMONIALS_DATA.filter(t => t.personaId === determinedPersonaId);
      if (personaTestimonials.length > 0) {
        // If we have persona-specific testimonials, show them.
        // We might want to add more logic here, e.g., fill up to 3 with generic ones if not enough specific ones.
        const otherTestimonials = TESTIMONIALS_DATA.filter(t => t.personaId !== determinedPersonaId);
        return [...personaTestimonials, ...otherTestimonials].slice(0, 3);
      }
    }
    // Default: show first 3 testimonials if no persona or no specific testimonials
    return TESTIMONIALS_DATA.slice(0, 3);
  }, [determinedPersonaId]);


  return (
    <section id="community" className="py-16 sm:py-24 bg-gray-800 bg-opacity-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-12"
          initial={{ opacity: 0, y:20 }}
          whileInView={{ opacity: 1, y:0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by Thousands of Amazon Sellers
        </motion.h2>

        {/* Testimonials Carousel (Static for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Success Metrics Dashboard */}
        <motion.div 
          className="bg-gray-900 p-8 rounded-xl shadow-2xl mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-center text-white mb-8">Our Community Impact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {SOCIAL_PROOF_METRICS.map((metric, index) => (
              <div key={index}>
                <AnimatedCounter 
                    to={metric.value} 
                    suffix={metric.suffix} 
                    prefix={metric.prefix}
                    className="text-4xl text-orange-400"
                />
                <p className="text-gray-400 mt-2">{metric.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Amazon Seller Evolution Matrix Preview */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y:20 }}
          whileInView={{ opacity: 1, y:0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Track Your Growth with the Amazon Seller Evolution Matrix™</h3>
          <div className="bg-gray-700 p-6 sm:p-10 rounded-lg shadow-xl max-w-3xl mx-auto">
            <p className="text-gray-300 mb-4">A comprehensive assessment, tracking, and progression system documenting your complete journey from beginner to portfolio owner.</p>
            {/* Placeholder for Matrix visual */}
            <div className="aspect-video bg-gray-600 rounded-md flex items-center justify-center">
              <p className="text-gray-400 text-lg">Matrix Visual Coming Soon</p>
            </div>
            <p className="text-sm text-gray-400 mt-4">This creates the definitive growth roadmap for the Amazon seller ecosystem.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
