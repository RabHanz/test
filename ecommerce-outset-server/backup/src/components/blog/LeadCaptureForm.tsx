import React, { useState } from 'react';

const LeadCaptureForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit">Subscribe</button>
      {submitted && <span>Thank you for subscribing!</span>}
    </form>
  );
};

export default LeadCaptureForm; 