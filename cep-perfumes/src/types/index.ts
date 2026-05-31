export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

export interface WhatsAppNumber {
  id: string;
  label: string;
  number: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type WhatsAppNumberInsert = Omit<WhatsAppNumber, 'id' | 'created_at'>;
