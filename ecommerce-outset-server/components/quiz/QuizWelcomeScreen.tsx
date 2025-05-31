
import React, { useState } from 'react';
import useQuizStore from '../../store/quizStore';
import Button from '../Button';
import { trackQuizEvent } from '../../utils/trackingUtils'; // Updated Import

interface QuizWelcomeScreenProps {
  quizTitleId?: string; // For aria-labelledby
}

const QuizWelcomeScreen: React.FC<QuizWelcomeScreenProps> = ({ quizTitleId }) => {
  const { email, setEmail, hasConsented, setHasConsented, startQuiz } = useQuizStore();
  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');

  const emailErrorId = "quiz-email-error";
  const consentErrorId = "quiz-consent-error";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!email) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!hasConsented) {
      setConsentError('You must agree to the terms to continue.');
      valid = false;
    } else {
      setConsentError('');
    }

    if (valid) {
      // trackQuizEvent is called inside startQuiz action in the store
      startQuiz();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8" aria-labelledby={quizTitleId || "quiz-welcome-heading"}>
      <h1 id={quizTitleId || "quiz-welcome-heading"} className="text-3xl md:text-4xl font-bold text-orange-400 mb-4">Discover Your Amazon Seller Persona</h1>
      <p className="text-gray-300 mb-6 md:mb-8 max-w-lg">
        Answer a few short questions to understand your unique strengths, challenges, and the ideal path for your Amazon success. Get personalized recommendations in under 5 minutes!
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="quiz-email" className="sr-only">Email Address</label>
          <input
            id="quiz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={`w-full px-4 py-3 rounded-md bg-gray-700 border ${emailError ? 'border-red-500' : 'border-gray-600'} text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder-gray-400`}
            aria-required="true"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? emailErrorId : undefined}
          />
          {emailError && <p id={emailErrorId} className="text-red-400 text-sm mt-1 text-left" role="alert">{emailError}</p>}
        </div>

        <div className="flex items-start space-x-2 text-left">
          <input
            id="quiz-consent"
            type="checkbox"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className={`mt-1 h-4 w-4 rounded border-gray-500 text-orange-500 focus:ring-orange-400 ${consentError ? 'border-red-500' : ''}`}
            aria-required="true"
            aria-invalid={!!consentError}
            aria-describedby={consentError ? consentErrorId : undefined}
          />
          <div>
            <label htmlFor="quiz-consent" className="text-sm text-gray-300">
              I agree to receive personalized results and occasional updates from Ecommerce Outset. We respect your privacy.
            </label>
            {consentError && <p id={consentErrorId} className="text-red-400 text-sm mt-1" role="alert">{consentError}</p>}
          </div>
        </div>
         <p className="text-xs text-gray-400 text-left mt-2">
            Your data is handled in accordance with GDPR. You can unsubscribe at any time.
          </p>

        <Button type="submit" variant="primary" size="lg" className="w-full !mt-6">
          Start Quiz & Get My Results
        </Button>
      </form>
    </div>
  );
};

export default QuizWelcomeScreen;
