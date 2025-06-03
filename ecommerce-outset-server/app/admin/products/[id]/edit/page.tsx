import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Product } from '@/types/product';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    redirect('/admin/products');
  }

  // Ensure the product data matches the Product type
  const typedProduct: Product = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    sku: product.sku,
    stock: product.stock,
    category: product.category,
    images: product.images || [],
    status: product.status as 'active' | 'inactive' | 'draft',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <div className="space-y-6">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Update product information.
            </p>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <ProductForm product={typedProduct} mode="edit" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 