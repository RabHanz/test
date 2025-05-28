import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode; 
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children, className = '', actions }) => {
  return (
    <motion.section
      className={`bg-gray-800 rounded-xl shadow-xl p-4 md:p-6 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
        {actions && <div className="mt-2 sm:mt-0">{actions}</div>}
      </div>
      {children}
    </motion.section>
  );
};

export default SectionWrapper;
