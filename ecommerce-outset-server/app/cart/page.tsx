'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';

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
                {items.map((item) => (
                  <li key={item.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      {item.image ? (
                         <Image
                            src={item.image}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                          />
                      ) : (
                        <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 sm:h-32 sm:w-32">No Image</div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link href={`/products/${item.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                {item.name}
                              </Link>
                            </h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity, {item.name}</label>
                          <select
                            id={`quantity-${item.id}`}
                            name={`quantity-${item.id}`}
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                            className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {[...Array(item.stock).keys()].map((_, i) => (
                              <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>

                          <div className="absolute right-0 top-0">
                            <button type="button" onClick={() => removeItem(item.id)} className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                              <span className="sr-only">Remove</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                            </button>
                          </div>
                        </div>
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