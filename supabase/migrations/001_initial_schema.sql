-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories (legal, qoe, accounting, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,                           -- Lucide icon name
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers (the professionals)
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  headshot_url TEXT,
  logo_url TEXT,
  tagline TEXT,                        -- Short description
  bio TEXT,                            -- Full description
  city TEXT,
  state TEXT,
  is_remote BOOLEAN DEFAULT false,
  deal_size_min INT,                   -- In thousands (e.g., 500 = $500K)
  deal_size_max INT,
  years_experience INT,
  deals_closed INT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider-Category junction (many-to-many)
CREATE TABLE provider_categories (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);

-- Services (specific offerings within categories)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(slug, category_id)
);

-- Provider-Services junction
CREATE TABLE provider_services (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, service_id)
);

-- Inquiries (contact form submissions)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  company_name TEXT,
  message TEXT NOT NULL,
  deal_context TEXT,                   -- "Buying a business", "Selling", etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_providers_state ON providers(state);
CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_providers_featured ON providers(is_featured);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_inquiries_provider ON inquiries(provider_id);
CREATE INDEX idx_inquiries_unread ON inquiries(is_read) WHERE is_read = false;

-- Full-text search index for providers
ALTER TABLE providers ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(bio, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(state, '')), 'D')
  ) STORED;

CREATE INDEX idx_providers_search ON providers USING GIN(search_vector);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for providers updated_at
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Public read access for active providers
CREATE POLICY "Active providers are viewable by everyone" ON providers
  FOR SELECT USING (is_active = true);

-- Public read access for provider_categories
CREATE POLICY "Provider categories are viewable by everyone" ON provider_categories
  FOR SELECT USING (true);

-- Public read access for services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- Public read access for provider_services
CREATE POLICY "Provider services are viewable by everyone" ON provider_services
  FOR SELECT USING (true);

-- Anyone can insert inquiries
CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Authenticated users can manage all data (for admin)
CREATE POLICY "Authenticated users can manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage provider_categories" ON provider_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage provider_services" ON provider_services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage inquiries" ON inquiries
  FOR ALL USING (auth.role() = 'authenticated');
