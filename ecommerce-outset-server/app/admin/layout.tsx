import React from 'react';

// TODO: Replace this placeholder with the real AdminHeader implementation
const PlaceholderAdminHeader: React.FC = () => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Admin Header Placeholder</h2>
      <p>This is a placeholder for the real AdminHeader component.</p>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <PlaceholderAdminHeader />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 