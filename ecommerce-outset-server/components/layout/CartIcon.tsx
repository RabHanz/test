'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export function CartIcon() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Link href="/cart" className="group -m-2 flex items-center p-2">
      <svg className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.023.8l2.513 12.928c.235 1.15.964 2.093 2.116 2.537R17.248 21H20.25a.75.75 0 000-1.5H17.25a.75.75 0 00-.621-.535l-1.442-6.65a1.5 1.5 0 00-.359-.836F11.42 8.75a1.5 1.5 0 00-1.17-.423H6.617M12 3v.375a.75.75 0 001.5 0V3h3.75a.75.75 0 000-1.5H13.5V1.5a.75.75 0 00-1.5 0v.75H6.75a.75.75 0 000 1.5h.386z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5h.002m-4.5 1.5H15m-6 1.5H9m-3 1.5H6m-3 1.5H3" />
      </svg>
      <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">{itemCount}</span>
      <span className="sr-only">items in cart, view bag</span>
    </Link>
  );
} 