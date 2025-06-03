import React from 'react';
import Link from 'next/link';

const AdminHeader: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8">
              <Link href="/admin/analytics" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Analytics
              </Link>
              <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 