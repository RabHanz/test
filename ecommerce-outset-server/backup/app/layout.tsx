import React from 'react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PersonalizationProvider } from '@/context/PersonalizationContext';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ecommerce Outset - Amazon Seller Ecosystem',
  description: 'The Complete Amazon Ecosystem: Where Every Member Finds Their Perfect Next Step.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        <PersonalizationProvider>
          <Header />
          <main role="main" className="flex-grow pt-16 md:pt-[72px]" aria-live="polite" aria-atomic="true">
            {children}
          </main>
          <Footer />
        </PersonalizationProvider>
      </body>
    </html>
  );
} 