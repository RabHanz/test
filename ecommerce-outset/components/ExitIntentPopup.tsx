
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ExitIntentPopupProps } from '../types';
import Button from './Button';
import { CloseIcon } from './icons';
import { trackExitIntentConversion, trackCTAClick } from '../utils/trackingUtils'; // Updated Import

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ content, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email address.');
      emailInputRef.current?.focus();
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      emailInputRef.current?.focus();
      return;
    }
    setEmailError('');
    trackExitIntentConversion(content.headline, email); // Using headline as a proxy for persona context
    trackCTAClick(`Exit Intent Submit - ${content.ctaText}`);
    onSubmit(email);
  };

  const accentColorMap: Record<string, { bg: string, border: string, text: string, ring: string, hoverBg: string }> = {
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-300', ring: 'focus:ring-green-400', hoverBg: 'hover:bg-green-600' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-300', ring: 'focus:ring-blue-400', hoverBg: 'hover:bg-blue-600' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-300', ring: 'focus:ring-purple-400', hoverBg: 'hover:bg-purple-600' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-300', ring: 'focus:ring-yellow-400', hoverBg: 'hover:bg-yellow-600' },
    teal: { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-300', ring: 'focus:ring-teal-400', hoverBg: 'hover:bg-teal-600' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-300', ring: 'focus:ring-orange-400', hoverBg: 'hover:bg-orange-600' },
    gray: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-300', ring: 'focus:ring-gray-400', hoverBg: 'hover:bg-gray-600' }
  };
  const colorTheme = accentColorMap[content.accentColorClass] || accentColorMap.orange;

  const headlineId = "exit-intent-headline";
  const descriptionId = "exit-intent-description";
  const emailErrorId = "exit-intent-email-error";

  useEffect(() => {
    // Focus the first focusable element in the modal, typically the email input or close button.
    emailInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Basic focus trapping (can be improved with a library)
      if (event.key === 'Tab' && popupRef.current) {
        const focusableElements = popupRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[200] p-4"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby={headlineId}
      aria-describedby={descriptionId}
      ref={popupRef}
    >
      <div
        className={`relative bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-t-4 ${colorTheme.border}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-1 rounded-full focus:ring-2 focus:ring-white"
          aria-label="Close exit intent popup"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        {content.imageUrl && (
          // If image is purely decorative, alt="". If it conveys info, provide descriptive alt.
          <img src={content.imageUrl} alt="" className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-gray-700 object-cover" />
        )}

        <h2 id={headlineId} className={`text-2xl font-bold ${colorTheme.text} mb-3`}>{content.headline}</h2>
        <p id={descriptionId} className="text-gray-300 mb-6 text-sm">{content.offer}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="exit-intent-email" className="sr-only">Email Address</label>
            <input
              ref={emailInputRef}
              id="exit-intent-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={`w-full px-4 py-2.5 rounded-md bg-gray-700 border ${emailError ? 'border-red-500' : 'border-gray-600'} text-gray-100 focus:ring-2 ${colorTheme.ring} focus:border-transparent outline-none placeholder-gray-400`}
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? emailErrorId : undefined}
            />
            {emailError && <p id={emailErrorId} className="text-red-400 text-xs mt-1 text-left" role="alert">{emailError}</p>}
          </div>
          <Button
            type="submit"
            variant="custom"
            customColorClass={`${colorTheme.bg} ${colorTheme.hoverBg}`}
            className="w-full text-white"
            size="lg"
          >
            {content.ctaText}
          </Button>
        </form>

        <button
          type="button"
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          onClick={onClose}
        >
          No, thanks
        </button>
      </div>
    </motion.div>
  );
};

export default ExitIntentPopup;
