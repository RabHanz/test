export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  image?: string | null;
  stock: number;
  category: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
} 