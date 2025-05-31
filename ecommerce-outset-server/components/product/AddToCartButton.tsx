import React from 'react';
'use client';

import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="mt-6 flex items-center space-x-4">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          type="button"
          onClick={() => setQuantity((prev: number) => Math.max(1, prev - 1))}
          className="px-3 py-1 text-gray-600 hover:text-gray-900"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          max={product.stock} // Prevent adding more than available stock
          className="w-12 text-center border-l border-r border-gray-300 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setQuantity((prev: number) => Math.min(product.stock, prev + 1))}
          className="px-3 py-1 text-gray-600 hover:text-gray-900"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={product.stock === 0 || quantity > product.stock}
        className="flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to cart
      </button>
    </div>
  );
} 