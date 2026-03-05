/*
  # Add Wishlist Table

  1. New Tables
    - `wishlist`
      - `wishlist_id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `product_id` (uuid, foreign key to products)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `wishlist` table
    - Add policies for customers to manage their own wishlist
*/

CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can add to own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can remove from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.customer_id = wishlist.customer_id
      AND customers.user_id = auth.uid()
    )
  );