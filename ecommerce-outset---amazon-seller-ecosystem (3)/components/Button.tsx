import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'custom' | 'link';
  customColorClass?: string; 
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  customColorClass,
  size = 'md',
  className = '', 
  ...props 
}) => {
  let baseClasses = "font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  let sizeClasses = "";
  let colorClasses = "";

  if (variant === 'primary') {
    colorClasses = "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400";
    if (size === 'sm') sizeClasses = "px-4 py-2 text-sm";
    else if (size === 'lg') sizeClasses = "px-8 py-3 text-lg";
    else sizeClasses = "px-6 py-2.5 text-base";
  } else if (variant === 'secondary') {
    colorClasses = "bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500";
    if (size === 'sm') sizeClasses = "px-4 py-2 text-sm";
    else if (size === 'lg') sizeClasses = "px-8 py-3 text-lg";
    else sizeClasses = "px-6 py-2.5 text-base";
  } else if (variant === 'custom' && customColorClass) {
    colorClasses = `${customColorClass} text-white focus:ring-gray-500`; // Assuming white text for custom unless specified
    if (size === 'sm') sizeClasses = "px-4 py-2 text-sm";
    else if (size === 'lg') sizeClasses = "px-8 py-3 text-lg";
    else sizeClasses = "px-6 py-2.5 text-base";
  } else if (variant === 'link') {
    colorClasses = "bg-transparent hover:bg-transparent focus:ring-gray-400"; // Text color will come from className
    // Links typically have minimal padding or specific needs covered by className
    if (size === 'sm') sizeClasses = "px-1 py-0.5 text-sm";
    else if (size === 'lg') sizeClasses = "px-2 py-1 text-lg";
    else sizeClasses = "px-1 py-0.5 text-base"; // Default md size for link
  }
  
  const finalClassName = `${baseClasses} ${sizeClasses} ${colorClasses} ${className}`.trim();

  return (
    <motion.button
      whileHover={{ scale: variant === 'link' ? 1.0 : 1.05 }} // Link might not need scale, or a more subtle one
      whileTap={{ scale: variant === 'link' ? 1.0 : 0.95 }}
      className={finalClassName}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;