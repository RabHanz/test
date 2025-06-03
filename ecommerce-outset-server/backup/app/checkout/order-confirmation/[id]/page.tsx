import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Order } from '@/types/order';

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  }) as Order | null;

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shippingAddress as Order['shippingAddress'];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">Order Placed Successfully!</h1>
          <p className="mt-4 text-base text-gray-500">Your order has been confirmed and is being processed.</p>
          <p className="mt-2 text-sm text-gray-500">Order Number: <span className="font-medium text-gray-900">{order.id}</span></p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Order Summary</h2>

          <div className="mt-6 border-t border-b border-gray-200 py-6">
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Order Status</dt>
                <dd className="text-sm font-medium text-gray-900">{order.status}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Payment Status</dt>
                <dd className="text-sm font-medium text-gray-900">{order.paymentStatus}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Order Total</dt>
                <dd className="text-base font-medium text-gray-900">${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Items Ordered</h2>
          <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200 mt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="flex-shrink-0">
                   {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-cover object-center"
                      />
                   ) : (
                     <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                   )}
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-sm">
                        <span className="font-medium text-gray-900">{item.product.name}</span>
                      </h3>
                      <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))
          )}
          </ul>
        </div>

        <div className="mt-12">
           <h2 className="text-xl font-bold tracking-tight text-gray-900">Shipping Address</h2>
            <div className="mt-4 text-gray-600 text-sm space-y-1">
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
            </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/products" className="text-base font-medium text-indigo-600 hover:text-indigo-500">Continue Shopping</Link>
        </div>

      </div>
    </div>
  );
} 