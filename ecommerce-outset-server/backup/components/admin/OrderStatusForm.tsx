'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order, OrderStatus, PaymentStatus } from '@prisma/client';

interface OrderStatusFormProps {
  order: Order;
}

export function OrderStatusForm({ order }: OrderStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: order.status,
    paymentStatus: order.paymentStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      setSuccess('Order updated successfully');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Order Status
          </label>
          <div className="mt-1">
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
            Payment Status
          </label>
          <div className="mt-1">
            <select
              name="paymentStatus"
              id="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Order Status'}
        </button>
      </div>
    </form>
  );
} 