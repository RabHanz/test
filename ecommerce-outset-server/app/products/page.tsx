import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0, // Only show products with stock > 0
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product: Product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={320} // Adjust based on your design needs
                    height={320} // Adjust based on your design needs
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link href={`/products/${product.id}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 