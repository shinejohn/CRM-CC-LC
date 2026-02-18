/**
 * Service catalog and order types
 */

export interface Service {
  id: string;
  name: string;
  slug?: string;
  type: string;
  description?: string;
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug?: string;
  created_at: string;
}

export interface Order {
  id: string;
  smb_id: string;
  status: string;
  total?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  service_id: string;
  quantity: number;
  price?: number;
}
