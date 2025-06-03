import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Pricing', href: '/pricing' },
];

export default function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-gray-200 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Ecommerce Outset
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              {navigation.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-base font-medium ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <Link
              href="/admin/dashboard"
              className="inline-block bg-indigo-600 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-700"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 