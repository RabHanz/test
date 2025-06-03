'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types/product';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) =>
        set(state => {
          const existingItemIndex = state.items.findIndex(
            item => item.id === product.id
          );

          if (existingItemIndex > -1) {
            // Update quantity if item already exists
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          } else {
            // Add new item
            return { items: [...state.items, { ...product, quantity }] };
          }
        }),
      removeItem: productId =>
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
        })),
      updateItemQuantity: (productId, quantity) =>
        set(state => {
          const newItems = state.items.map(item =>
            item.id === productId ? { ...item, quantity: quantity } : item
          );
          return { items: newItems.filter(item => item.quantity > 0) };
        }),
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'ecommerce-cart-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
); 