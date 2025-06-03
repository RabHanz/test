import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Ecommerce Outset</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
            <li><Link href="/resources" className="hover:text-gray-300">Resources</Link></li>
            <li><Link href="/tools" className="hover:text-gray-300">Tools</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 