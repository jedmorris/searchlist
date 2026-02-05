-- Quiz/Matching Tool Schema
-- Stores quiz responses and matched providers for leads

-- Quiz leads table
CREATE TABLE IF NOT EXISTS quiz_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Contact info (captured before showing results)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,

  -- Quiz responses
  service_needs TEXT[] NOT NULL DEFAULT '{}', -- Category slugs they're interested in
  deal_size_range TEXT, -- 'under-500k', '500k-1m', '1m-5m', '5m-10m', '10m-plus'
  location_preference TEXT, -- State code or 'remote'
  timeline TEXT, -- 'immediate', '1-3-months', '3-6-months', '6-plus-months'
  additional_notes TEXT,

  -- Matching results
  matched_provider_ids UUID[] DEFAULT '{}',
  match_scores JSONB DEFAULT '{}', -- { provider_id: score }

  -- Tracking
  source TEXT DEFAULT 'quiz', -- Where the lead came from
  ip_address TEXT,
  user_agent TEXT,
  converted_to_inquiry BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created_at ON quiz_leads(created_at DESC);

-- RLS policies
ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public quiz submission)
CREATE POLICY "Anyone can submit quiz"
  ON quiz_leads FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view quiz leads
CREATE POLICY "Admins can view all quiz leads"
  ON quiz_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update quiz leads
CREATE POLICY "Admins can update quiz leads"
  ON quiz_leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to match providers based on quiz answers
CREATE OR REPLACE FUNCTION match_quiz_providers(
  p_service_needs TEXT[],
  p_deal_size_range TEXT,
  p_location_preference TEXT,
  p_limit INTEGER DEFAULT 5
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
  deal_size_min INTEGER,
  deal_size_max INTEGER,
  match_score INTEGER
) AS $$
DECLARE
  min_deal INTEGER;
  max_deal INTEGER;
BEGIN
  -- Parse deal size range
  CASE p_deal_size_range
    WHEN 'under-500k' THEN min_deal := 0; max_deal := 500000;
    WHEN '500k-1m' THEN min_deal := 500000; max_deal := 1000000;
    WHEN '1m-5m' THEN min_deal := 1000000; max_deal := 5000000;
    WHEN '5m-10m' THEN min_deal := 5000000; max_deal := 10000000;
    WHEN '10m-plus' THEN min_deal := 10000000; max_deal := 100000000;
    ELSE min_deal := NULL; max_deal := NULL;
  END CASE;

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
    p.deal_size_min,
    p.deal_size_max,
    (
      -- Category match (up to 40 points)
      CASE WHEN array_length(p_service_needs, 1) > 0 THEN
        (SELECT COUNT(*)::INTEGER * 10
         FROM provider_categories pc
         JOIN categories c ON pc.category_id = c.id
         WHERE pc.provider_id = p.id
         AND c.slug = ANY(p_service_needs))
      ELSE 0 END
      +
      -- Deal size match (30 points)
      CASE
        WHEN min_deal IS NOT NULL AND max_deal IS NOT NULL THEN
          CASE WHEN
            (p.deal_size_min IS NULL OR p.deal_size_min <= max_deal) AND
            (p.deal_size_max IS NULL OR p.deal_size_max >= min_deal)
          THEN 30 ELSE 0 END
        ELSE 15 -- Partial points if no size preference
      END
      +
      -- Location match (20 points)
      CASE
        WHEN p_location_preference = 'remote' AND p.is_remote THEN 20
        WHEN p_location_preference IS NOT NULL AND p_location_preference != 'remote' AND p.state = p_location_preference THEN 20
        WHEN p_location_preference IS NOT NULL AND p_location_preference != 'remote' AND p.is_remote THEN 10
        WHEN p_location_preference IS NULL THEN 10
        ELSE 0
      END
      +
      -- Bonus points
      CASE WHEN p.is_verified THEN 5 ELSE 0 END
      +
      CASE WHEN p.is_featured THEN 5 ELSE 0 END
      +
      CASE WHEN p.rating_average >= 4.5 THEN 10
           WHEN p.rating_average >= 4.0 THEN 5
           ELSE 0 END
      +
      CASE WHEN p.rating_count >= 5 THEN 5
           WHEN p.rating_count >= 1 THEN 2
           ELSE 0 END
    )::INTEGER as match_score
  FROM providers p
  WHERE p.is_active = true
  ORDER BY
    match_score DESC,
    p.is_featured DESC,
    p.rating_average DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_quiz_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_leads_updated_at
  BEFORE UPDATE ON quiz_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_leads_updated_at();
