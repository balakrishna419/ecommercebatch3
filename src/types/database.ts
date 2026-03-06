export interface Category {
  category_id: string;
  category_name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  seller_id: string | null;
  category_id: string | null;
  mrp: number;
  stock: number;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  is_repair_service: boolean;
  created_at: string;
}

export interface Customer {
  customer_id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  age: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string;
}

export interface Cart {
  cart_id: string;
  customer_id: string;
  grand_total: number;
  items_total: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  order_date: string;
  shipping_date: string | null;
  order_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  created_at: string;
}

export interface Review {
  review_id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  description: string | null;
  created_at: string;
}

export interface Wishlist {
  wishlist_id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  customer_id: string;
  payment_mode: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'cash_on_delivery';
  payment_date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface Seller {
  seller_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  total_sales: number | null;
  created_at: string;
}
