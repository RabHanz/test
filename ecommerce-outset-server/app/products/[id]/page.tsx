import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { AddToCartButton } from '@/components/product/AddToCartButton';

// TODO: Replace this placeholder with the real AddToCartButton implementation
const PlaceholderAddToCartButton: React.FC = () => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Add To Cart Button Placeholder</h2>
      <p>This is a placeholder for the real AddToCartButton component.</p>
    </div>
  );
};

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product || product.stock <= 0) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        {/* Product image */}
        <div className="lg:max-w-lg lg:self-end">
          <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={600} // Adjust based on your design needs
                height={600} // Adjust based on your design needs
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
        </div>

        {/* Product details */}
        <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:max-w-lg lg:self-center">
          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <section aria-labelledby="information-heading" className="mt-4">
            <h2 id="information-heading" className="sr-only">
              Product information
            </h2>

            <div className="flex items-center">
              <p className="text-lg text-gray-900 sm:text-xl">${product.price.toFixed(2)}</p>
            </div>

            <div className="mt-4 space-y-6">
              <p className="text-base text-gray-500">{product.description}</p>
            </div>

            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock})</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="options-heading" className="mt-10">
            <h2 id="options-heading" className="sr-only">
              Product options
            </h2>

            {/* Add to cart form/button here */}
            {product.stock > 0 && <PlaceholderAddToCartButton />}

          </section>
        </div>
      </div>
    </div>
  );
}