-- ============================================================
-- CEP Perfumes – Supabase initialization
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id          UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT              NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2)    NOT NULL CHECK (price >= 0),
  image_url   TEXT,
  created_at  TIMESTAMPTZ       DEFAULT NOW(),
  updated_at  TIMESTAMPTZ       DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (anonymous store visitors)
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated admins can write
CREATE POLICY "Authenticated insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- 2b. WhatsApp numbers table
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id         UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
  label      TEXT              NOT NULL,
  number     TEXT              NOT NULL,
  is_active  BOOLEAN           NOT NULL DEFAULT true,
  sort_order INTEGER           NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ       DEFAULT NOW()
);

ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;

-- Anyone can read active numbers (store visitors)
CREATE POLICY "Public read whatsapp_numbers"
  ON whatsapp_numbers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert whatsapp_numbers"
  ON whatsapp_numbers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update whatsapp_numbers"
  ON whatsapp_numbers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete whatsapp_numbers"
  ON whatsapp_numbers FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read on images (bucket is public, but explicit policy is good practice)
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
