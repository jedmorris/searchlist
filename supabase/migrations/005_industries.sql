-- Migration: Add Industries feature
-- Description: Adds industry specializations for providers

-- Industries table
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider industries junction table
CREATE TABLE IF NOT EXISTS provider_industries (
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, industry_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_industries_slug ON industries(slug);
CREATE INDEX IF NOT EXISTS idx_industries_display_order ON industries(display_order);
CREATE INDEX IF NOT EXISTS idx_provider_industries_provider ON provider_industries(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_industries_industry ON provider_industries(industry_id);

-- RLS Policies for industries
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Anyone can read industries
CREATE POLICY "Industries are publicly readable"
  ON industries FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert/update/delete industries
CREATE POLICY "Admins can manage industries"
  ON industries FOR ALL
  USING (auth.role() = 'authenticated');

-- RLS Policies for provider_industries
ALTER TABLE provider_industries ENABLE ROW LEVEL SECURITY;

-- Anyone can read provider_industries
CREATE POLICY "Provider industries are publicly readable"
  ON provider_industries FOR SELECT
  USING (true);

-- Authenticated users can manage provider_industries
CREATE POLICY "Authenticated users can manage provider industries"
  ON provider_industries FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed some initial industries
INSERT INTO industries (name, slug, description, display_order) VALUES
  ('Technology', 'technology', 'Software, SaaS, IT services, and tech-enabled businesses', 1),
  ('Healthcare', 'healthcare', 'Medical practices, healthcare services, and health tech', 2),
  ('Manufacturing', 'manufacturing', 'Industrial, production, and fabrication businesses', 3),
  ('Real Estate', 'real-estate', 'Property management, development, and real estate services', 4),
  ('Professional Services', 'professional-services', 'Consulting, legal, accounting, and B2B services', 5),
  ('Retail', 'retail', 'Consumer goods, e-commerce, and retail operations', 6),
  ('Food & Beverage', 'food-beverage', 'Restaurants, food service, and F&B manufacturing', 7),
  ('Construction', 'construction', 'Building, contracting, and construction services', 8),
  ('Transportation & Logistics', 'transportation-logistics', 'Shipping, trucking, and logistics services', 9),
  ('Financial Services', 'financial-services', 'Banking, insurance, and financial advisory', 10)
ON CONFLICT (slug) DO NOTHING;
