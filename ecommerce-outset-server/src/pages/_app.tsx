import React from 'react';
import { AppProps } from 'next/app';
import { PersonalizationProvider } from '../context/PersonalizationContext';
import '../styles/personalization.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PersonalizationProvider>
      <Component {...pageProps} />
    </PersonalizationProvider>
  );
}

export default MyApp; 