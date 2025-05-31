'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, CreateProductData, UpdateProductData } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

const ProductForm = ({ product, mode }: ProductFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image: product?.image || '',
    stock: product?.stock || 0,
    category: product?.category || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = mode === 'create' ? '/api/products' : `/api/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${mode === 'create' ? 'Creation' : 'Update'} failed`);
      }

      setSuccess(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
      router.refresh();
      if (mode === 'create') {
        router.push('/admin/products');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `${mode === 'create' ? 'Creation' : 'Update'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: CreateProductData) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            name="description"
            id="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="price"
            id="price"
            min="0"
            step="0.01"
            required
            value={formData.price}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="image"
            id="image"
            value={formData.image || ''}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stock
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="stock"
            id="stock"
            min="0"
            required
            value={formData.stock}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="category"
            id="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
            : mode === 'create'
            ? 'Create Product'
            : 'Update Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 