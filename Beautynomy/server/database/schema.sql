-- Beautynomy PostgreSQL Schema for Supabase
-- This schema replaces MongoDB with PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  price_change DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Current prices table
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, platform)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lowest_price DECIMAL(10, 2) NOT NULL CHECK (lowest_price >= 0),
  average_price DECIMAL(10, 2) NOT NULL CHECK (average_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history details (individual platform prices at that point in time)
CREATE TABLE IF NOT EXISTS price_history_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  history_id UUID NOT NULL REFERENCES price_history(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL DEFAULT 'price_drop',
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(500) NOT NULL,
  drops JSONB NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);

CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_platform ON prices(platform);
CREATE INDEX IF NOT EXISTS idx_prices_amount ON prices(amount);

CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_details_history_id ON price_history_details(history_id);

CREATE INDEX IF NOT EXISTS idx_notifications_product_id ON notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create full-text search index for products
CREATE INDEX IF NOT EXISTS idx_products_search ON products
USING gin(to_tsvector('english', name || ' ' || brand || ' ' || COALESCE(description, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for prices
CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View to get products with their current prices (denormalized for performance)
CREATE OR REPLACE VIEW products_with_prices AS
SELECT
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'platform', pr.platform,
        'amount', pr.amount,
        'url', pr.url
      ) ORDER BY pr.amount
    ) FILTER (WHERE pr.id IS NOT NULL),
    '[]'::json
  ) AS prices,
  (SELECT MIN(amount) FROM prices WHERE product_id = p.id) AS lowest_price
FROM products p
LEFT JOIN prices pr ON p.id = pr.product_id
GROUP BY p.id;

-- View to get product statistics
CREATE OR REPLACE VIEW product_statistics AS
SELECT
  COUNT(*) AS total_products,
  COUNT(DISTINCT brand) AS total_brands,
  COUNT(DISTINCT category) AS total_categories,
  AVG(rating) AS average_rating,
  SUM(review_count) AS total_reviews
FROM products;

-- Function to get product with full details (prices + recent history)
CREATE OR REPLACE FUNCTION get_product_details(product_id_param VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'name', p.name,
    'brand', p.brand,
    'category', p.category,
    'description', p.description,
    'image', p.image,
    'rating', p.rating,
    'reviewCount', p.review_count,
    'priceChange', p.price_change,
    'createdAt', p.created_at,
    'updatedAt', p.updated_at,
    'prices', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'platform', pr.platform,
          'amount', pr.amount,
          'url', pr.url
        ) ORDER BY pr.amount
      ) FROM prices pr WHERE pr.product_id = p.id),
      '[]'::json
    ),
    'priceHistory', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'date', ph.date,
          'lowestPrice', ph.lowest_price,
          'averagePrice', ph.average_price,
          'prices', (
            SELECT json_agg(
              json_build_object(
                'platform', phd.platform,
                'amount', phd.amount
              )
            )
            FROM price_history_details phd
            WHERE phd.history_id = ph.id
          )
        ) ORDER BY ph.date DESC
      ) FROM price_history ph WHERE ph.product_id = p.id LIMIT 90),
      '[]'::json
    )
  ) INTO result
  FROM products p
  WHERE p.id = product_id_param;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE products IS 'Main products table storing beauty product information';
COMMENT ON TABLE prices IS 'Current prices for each product across different platforms';
COMMENT ON TABLE price_history IS 'Historical price snapshots for trend analysis';
COMMENT ON TABLE price_history_details IS 'Individual platform prices for each history snapshot';
COMMENT ON TABLE notifications IS 'Price drop notifications for users';
