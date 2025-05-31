import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import OrderStatusForm from '@/components/admin/OrderStatusForm';
import AdminHeader from '@/components/admin/AdminHeader';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface PlaceholderOrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
}

const PlaceholderOrderStatusForm: React.FC<PlaceholderOrderStatusFormProps> = ({
  orderId,
  currentStatus,
  onStatusChange,
}) => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold">Order Status Form Placeholder</h2>
      <p>This is a placeholder for the real OrderStatusForm component.</p>
    </div>
  );
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

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
  });

  if (!order) {
    redirect('/admin/orders');
  }

  // Safely parse the shipping address
  const shippingAddress = order.shippingAddress as unknown as ShippingAddress;

  return (
    <div>
      <AdminHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Order Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage order information.
            </p>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.user.name} ({order.user.email})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.paymentMethod}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                  <dl className="mt-4 space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Street</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {shippingAddress?.street}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {shippingAddress?.city}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">State</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {shippingAddress?.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {shippingAddress?.country}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {shippingAddress?.zipCode}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-8">
                <PlaceholderOrderStatusForm
                  orderId={params.id}
                  currentStatus="PENDING"
                  onStatusChange={async (newStatus: string) => {
                    'use server';
                    // Add your status update logic here
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 