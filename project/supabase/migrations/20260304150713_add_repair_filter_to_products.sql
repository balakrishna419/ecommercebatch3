/*
  # Add repair service filter to products

  1. New Column
    - `is_repair_service` (boolean, default false) - Indicates if product is a repair service
  
  2. Changes
    - Added `is_repair_service` column to products table
    - Allows filtering products as repair services or regular products
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_repair_service'
  ) THEN
    ALTER TABLE products ADD COLUMN is_repair_service boolean DEFAULT false;
  END IF;
END $$;