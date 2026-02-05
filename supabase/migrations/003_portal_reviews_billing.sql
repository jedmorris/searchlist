-- =============================================
-- Migration 003: Portal, Reviews, and Billing
-- =============================================

-- 1. User profiles (role system)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'provider', 'user')),
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create user_profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, display_name)
  VALUES (NEW.id, 'user', COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 2. Provider invitations
CREATE TABLE provider_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON provider_invitations(token);
CREATE INDEX idx_invitations_email ON provider_invitations(email);

-- 3. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;

-- Trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Review votes (helpful votes)
CREATE TABLE review_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, voter_ip)
);

-- 5. Add rating fields to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rating_average NUMERIC(2,1);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Function to update provider rating stats
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the provider's rating stats
  UPDATE providers
  SET
    rating_average = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider rating on review changes
CREATE TRIGGER update_provider_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_helpful_count_on_vote
  AFTER INSERT OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- 6. Provider subscriptions
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'featured', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing');

CREATE TABLE provider_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscription_provider ON provider_subscriptions(provider_id);
CREATE INDEX idx_subscription_stripe_customer ON provider_subscriptions(stripe_customer_id);

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON provider_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-set is_featured based on subscription tier
CREATE OR REPLACE FUNCTION sync_provider_featured_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Premium and Featured tiers get is_featured = true
  UPDATE providers
  SET is_featured = (NEW.tier IN ('featured', 'premium') AND NEW.status = 'active')
  WHERE id = NEW.provider_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_featured_on_subscription_change
  AFTER INSERT OR UPDATE ON provider_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_provider_featured_status();

-- 7. Feature purchases (one-time boosts)
CREATE TABLE feature_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('spotlight', 'homepage_feature', 'category_boost')),
  stripe_payment_intent_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_purchases_provider ON feature_purchases(provider_id);
CREATE INDEX idx_feature_purchases_active ON feature_purchases(is_active, expires_at) WHERE is_active = true;

-- 8. Payment history
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_history_provider ON payment_history(provider_id);

-- =============================================
-- Row Level Security Policies
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Provider invitations policies
CREATE POLICY "Admins can manage invitations" ON provider_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view invitation by token" ON provider_invitations
  FOR SELECT USING (true);

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own reviews" ON reviews
  FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    (author_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Providers can view reviews on their profile" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role = 'provider'
        AND up.provider_id = reviews.provider_id
    )
  );

-- Review votes policies
CREATE POLICY "Anyone can vote" ON review_votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Votes are viewable" ON review_votes
  FOR SELECT USING (true);

-- Provider subscriptions policies
CREATE POLICY "Providers can view own subscription" ON provider_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.provider_id = provider_subscriptions.provider_id
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON provider_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Feature purchases policies
CREATE POLICY "Providers can view own feature purchases" ON feature_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.provider_id = feature_purchases.provider_id
    )
  );

CREATE POLICY "Admins can manage all feature purchases" ON feature_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment history policies
CREATE POLICY "Providers can view own payment history" ON payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.provider_id = payment_history.provider_id
    )
  );

CREATE POLICY "Admins can manage all payment history" ON payment_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Full-text search function for providers
-- =============================================

CREATE OR REPLACE FUNCTION search_providers(
  search_query TEXT,
  category_filter UUID DEFAULT NULL,
  state_filter TEXT DEFAULT NULL,
  min_deal_size INTEGER DEFAULT NULL,
  max_deal_size INTEGER DEFAULT NULL,
  remote_only BOOLEAN DEFAULT false,
  verified_only BOOLEAN DEFAULT false,
  featured_only BOOLEAN DEFAULT false,
  min_rating NUMERIC DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  company_name TEXT,
  tagline TEXT,
  city TEXT,
  state TEXT,
  is_remote BOOLEAN,
  is_verified BOOLEAN,
  is_featured BOOLEAN,
  headshot_url TEXT,
  rating_average NUMERIC,
  rating_count INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.company_name,
    p.tagline,
    p.city,
    p.state,
    p.is_remote,
    p.is_verified,
    p.is_featured,
    p.headshot_url,
    p.rating_average,
    p.rating_count,
    CASE
      WHEN search_query IS NOT NULL AND search_query != ''
      THEN ts_rank(p.search_vector, websearch_to_tsquery('english', search_query))
      ELSE 1.0
    END AS rank
  FROM providers p
  LEFT JOIN provider_categories pc ON pc.provider_id = p.id
  WHERE p.is_active = true
    AND (
      search_query IS NULL
      OR search_query = ''
      OR p.search_vector @@ websearch_to_tsquery('english', search_query)
    )
    AND (category_filter IS NULL OR pc.category_id = category_filter)
    AND (state_filter IS NULL OR p.state = state_filter)
    AND (min_deal_size IS NULL OR p.deal_size_min >= min_deal_size)
    AND (max_deal_size IS NULL OR p.deal_size_max <= max_deal_size)
    AND (remote_only = false OR p.is_remote = true)
    AND (verified_only = false OR p.is_verified = true)
    AND (featured_only = false OR p.is_featured = true)
    AND (min_rating IS NULL OR p.rating_average >= min_rating)
  GROUP BY p.id
  ORDER BY
    p.is_featured DESC,
    rank DESC,
    p.rating_average DESC NULLS LAST,
    p.rating_count DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;
