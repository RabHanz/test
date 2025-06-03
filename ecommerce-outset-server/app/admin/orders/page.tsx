import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const orders = await prisma.order.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <div className="space-y-6">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Manage customer orders and track their status.
            </p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <li className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found.
                </li>
              ) : (
                orders.map((order) => (
                  <li key={order.id}>
                    <Link href={`/admin/orders/${order.id}`} className="block hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order #{order.id.slice(-6)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.user.name} ({order.user.email})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-900">${order.total.toFixed(2)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {order.paymentStatus}
                            </span>
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