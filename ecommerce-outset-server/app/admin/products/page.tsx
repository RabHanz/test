import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

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
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog and inventory.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.length === 0 ? (
            <li className="px-6 py-4 text-center text-sm text-gray-500">
              No products found. Add your first product to get started.
            </li>
          ) : (
            products.map((product) => (
              <li key={product.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-900">${product.price}</span>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
} 