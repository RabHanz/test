'use client';

import { useState } from 'react';
import Button from '../Button';

interface LeadCaptureFormProps {
  onSubmit?: (email: string) => void;
  buttonText?: string;
  placeholder?: string;
}

export const LeadCaptureForm = ({
  onSubmit,
  buttonText = 'Subscribe',
  placeholder = 'Enter your email',
}: LeadCaptureFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Basic email validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (onSubmit) {
        await onSubmit(email);
      }
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Subscribing...' : buttonText}
        </Button>
      </div>
    </form>
  );
}; 