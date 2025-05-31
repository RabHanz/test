'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import type { CreateOrderData } from '@/types/order';

export default function PaymentPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // Default payment method
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect to cart if empty
  if (items.length === 0) {
    router.push('/cart');
    return null; // Prevent rendering
  }

  // In a real app, you would retrieve shipping address from state/context
  // For now, using a placeholder or assuming it's saved elsewhere
  const shippingAddress = {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    country: 'USA',
    zipCode: '12345',
  }; // Placeholder shipping address

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          // Assuming item.price is available on the cart item
          price: item.price, 
        })),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order placement failed');
      }

      // Clear cart on successful order
      clearCart();

      // Redirect to order confirmation page
      router.push(`/checkout/order-confirmation/${data.order.id}`);

    } catch (error) {
      console.error('Order placement error:', error);
      setError(error instanceof Error ? error.message : 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Payment Information</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="order-summary-heading" className="lg:col-span-7">
            <h2 id="order-summary-heading" className="text-lg font-medium text-gray-900">Order Summary</h2>

            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200 mt-4">
              {items.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="flex-shrink-0">
                     {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover object-center"
                        />
                     ) : (
                       <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                     )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </h3>
                        <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

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

          </section>

          <section aria-labelledby="payment-info-heading" className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
             <h2 id="payment-info-heading" className="text-lg font-medium text-gray-900">Payment Details</h2>

             {error && (
              <div className="rounded-md bg-red-50 p-4 mt-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <form className="mt-6 space-y-6" onSubmit={handlePlaceOrder}>
               {/* Payment Method Selection */}
               <div>
                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">Payment Method</label>
                 <select
                    id="payment-method"
                    name="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 >
                    <option value="credit_card">Credit Card</option>
                     {/* Add other payment options here */}
                 </select>
               </div>

               {/* Placeholder Payment Form */}
               <div className="rounded-md bg-yellow-50 p-4">
                <div className="text-sm text-yellow-800">
                    Payment gateway integration is pending. This is a placeholder form.
                </div>
               </div>

               <div>
                <button
                  type="submit"
                  disabled={loading || items.length === 0} // Disable if loading or cart is empty
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>

          </section>

        </div>
      </div>
    </div>
  );
} 