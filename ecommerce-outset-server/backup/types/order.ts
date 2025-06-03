import { OrderStatus, PaymentStatus } from '@prisma/client';
import type { Product } from './product';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
} 