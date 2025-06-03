'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import type { CartItem } from '@/types/cart';

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, getTotalPrice } = useCart();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            Your cart is empty. <Link href="/products" className="text-indigo-600 hover:text-indigo-500">Continue Shopping</Link>
          </div>
        ) : (
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

              <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {items.map((item: CartItem) => (
                  <li key={item.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      {item.product?.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={200}
                          height={200}
                          className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-md bg-gray-200 sm:h-32 sm:w-32" />
                      )}
                    </div>
                    <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm">
                            <Link href={`/products/${item.productId}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {item.product?.name}
                            </Link>
                          </h4>
                          <p className="ml-4 text-sm font-medium text-gray-900">${item.product?.price}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.product?.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-medium text-gray-900">Order summary</h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${getTotalPrice().toFixed(2)}</dd>
                </div>
                {/* Add shipping and tax calculation here later */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order total</dt>
                  <dd className="text-base font-medium text-gray-900">${getTotalPrice().toFixed(2)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
} 