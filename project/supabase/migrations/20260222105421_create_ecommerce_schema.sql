/*
  # E-Commerce Management System - Complete Database Schema

  ## Overview
  This migration creates a comprehensive e-commerce database with 9 main entities and their relationships.

  ## New Tables Created

  ### 1. Categories
  - `category_id` (uuid, primary key)
  - `category_name` (text, unique, not null)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 2. Sellers
  - `seller_id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text, not null)
  - `phone` (text)
  - `email` (text, unique)
  - `total_sales` (numeric, default 0)
  - `created_at` (timestamptz)

  ### 3. Products
  - `product_id` (uuid, primary key)
  - `product_name` (text, not null)
  - `seller_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - `mrp` (numeric, not null)
  - `stock` (integer, default 0)
  - `brand` (text)
  - `description` (text)
  - `image_url` (text)
  - `created_at` (timestamptz)

  ### 4. Customers
  - `customer_id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text, not null)
  - `email` (text, unique)
  - `phone` (text)
  - `date_of_birth` (date)
  - `age` (integer)
  - `address` (text)
  - `city` (text)
  - `state` (text)
  - `postal_code` (text)
  - `created_at` (timestamptz)

  ### 5. Carts
  - `cart_id` (uuid, primary key)
  - `customer_id` (uuid, foreign key, unique)
  - `grand_total` (numeric, default 0)
  - `items_total` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. Cart Items
  - `cart_item_id` (uuid, primary key)
  - `cart_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer, not null)
  - `price` (numeric, not null)
  - `created_at` (timestamptz)

  ### 7. Orders
  - `order_id` (uuid, primary key)
  - `customer_id` (uuid, foreign key)
  - `order_date` (timestamptz, default now())
  - `shipping_date` (timestamptz)
  - `order_amount` (numeric, not null)
  - `status` (text, default 'pending')
  - `shipping_address` (text)
  - `created_at` (timestamptz)

  ### 8. Order Items
  - `order_item_id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer, not null)
  - `mrp` (numeric, not null)
  - `created_at` (timestamptz)

  ### 9. Reviews
  - `review_id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `customer_id` (uuid, foreign key)
  - `rating` (integer, check 1-5)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 10. Payments
  - `payment_id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `customer_id` (uuid, foreign key)
  - `payment_mode` (text, not null)
  - `payment_date` (timestamptz, default now())
  - `amount` (numeric, not null)
  - `status` (text, default 'pending')
  - `created_at` (timestamptz)

  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Policies restrict access based on user authentication and ownership
  - Customers can only view/modify their own data
  - Sellers can manage their own products
  - Public can view products and categories
*/

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
  seller_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text UNIQUE,
  total_sales numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  seller_id uuid REFERENCES sellers(seller_id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(category_id) ON DELETE SET NULL,
  mrp numeric NOT NULL CHECK (mrp >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  brand text,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  date_of_birth date,
  age integer,
  address text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz DEFAULT now()
);

-- Create Carts Table
CREATE TABLE IF NOT EXISTS carts (
  cart_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE UNIQUE,
  grand_total numeric DEFAULT 0 CHECK (grand_total >= 0),
  items_total integer DEFAULT 0 CHECK (items_total >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(cart_id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(product_id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  order_date timestamptz DEFAULT now(),
  shipping_date timestamptz,
  order_amount numeric NOT NULL CHECK (order_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address text,
  created_at timestamptz DEFAULT now()
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(product_id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  mrp numeric NOT NULL CHECK (mrp >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(product_id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(customer_id) ON DELETE CASCADE,
  payment_mode text NOT NULL CHECK (payment_mode IN ('credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery')),
  payment_date timestamptz DEFAULT now(),
  amount numeric NOT NULL CHECK (amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for Sellers
CREATE POLICY "Sellers can view own profile"
  ON sellers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Sellers can update own profile"
  ON sellers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create seller profile"
  ON sellers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Products (public read, seller write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.seller_id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.seller_id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.seller_id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sellers
      WHERE sellers.seller_id = products.seller_id
      AND sellers.user_id = auth.uid()
    )
  );

-- RLS Policies for Customers
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create customer profile"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Carts
CREATE POLICY "Customers can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = carts.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- RLS Policies for Cart Items
CREATE POLICY "Customers can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      JOIN customers ON customers.customer_id = carts.customer_id
      WHERE carts.cart_id = cart_items.cart_id
      AND customers.user_id = auth.uid()
    )
  );

-- RLS Policies for Orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = orders.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- RLS Policies for Order Items
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.customer_id = orders.customer_id
      WHERE orders.order_id = order_items.order_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.customer_id = orders.customer_id
      WHERE orders.order_id = order_items.order_id
      AND customers.user_id = auth.uid()
    )
  );

-- RLS Policies for Reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Customers can create own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = reviews.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- RLS Policies for Payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );