import { useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setItems([]);

  return {
    items,
    addItem,
    removeItem,
    clearCart,
  };
} 