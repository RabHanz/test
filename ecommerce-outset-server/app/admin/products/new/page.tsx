import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ProductForm } from '@/components/admin/ProductForm';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">New Product</h1>
        <div className="space-y-6">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product for your store.
            </p>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ProductForm mode="create" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 