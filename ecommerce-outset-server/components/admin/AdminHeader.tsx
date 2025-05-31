import React from 'react';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const pathname = usePathname();
  const title = pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
} 