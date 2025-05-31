import { Suspense } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-grow">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
} 