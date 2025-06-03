import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="space-y-6">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product catalog.
            </p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <li className="px-6 py-4 text-center text-sm text-gray-500">
                  No products found.
                </li>
              ) : (
                products.map((product) => (
                  <li key={product.id}>
                    <Link href={`/admin/products/${product.id}/edit`} className="block hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${product.price.toFixed(2)} - Stock: {product.stock}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 