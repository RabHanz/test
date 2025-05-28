
import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperClientProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode; 
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  accentColorClass?: string; // e.g. 'text-green-400'
}

const SectionWrapperClient: React.FC<SectionWrapperClientProps> = ({ 
    title, 
    description, 
    children, 
    className = '', 
    actions,
    icon: Icon,
    accentColorClass = 'text-orange-400'
}) => {
  return (
    <motion.section
      className={`bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center">
          {Icon && <Icon className={`w-6 h-6 mr-3 hidden sm:block ${accentColorClass}`} />}
          <h2 className={`text-xl md:text-2xl font-semibold text-white ${accentColorClass}`}>{title}</h2>
        </div>
        {actions && <div className="mt-3 sm:mt-0 self-start sm:self-center">{actions}</div>}
      </div>
      {description && <p className="text-sm text-gray-400 mb-6 max-w-3xl">{description}</p>}
      {children}
    </motion.section>
  );
};

export default SectionWrapperClient;
