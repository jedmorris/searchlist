-- Blog Posts Table for "Still Searching with Jed Morris" podcast
-- Each post contains a YouTube video embed and transcribed article

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT, -- Short description for cards/SEO

  -- Video info
  youtube_video_id TEXT NOT NULL, -- e.g., "dQw4w9WgXcQ"
  video_duration TEXT, -- e.g., "45:32"

  -- Content
  content TEXT NOT NULL, -- Markdown/HTML transcript

  -- Metadata
  author_name TEXT NOT NULL DEFAULT 'Jed Morris',
  author_image_url TEXT,
  published_at TIMESTAMPTZ,
  reading_time_minutes INTEGER, -- Estimated reading time

  -- Categorization
  category TEXT, -- e.g., "Due Diligence", "Financing", "Operations"
  tags TEXT[], -- Array of tags for filtering

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT, -- Thumbnail/OG image

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured, published_at DESC);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Seed with sample blog posts
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  youtube_video_id,
  video_duration,
  content,
  author_name,
  published_at,
  reading_time_minutes,
  category,
  tags,
  meta_description,
  is_published,
  is_featured
) VALUES
(
  'What is Entrepreneurship Through Acquisition (ETA)?',
  'what-is-eta',
  'A comprehensive introduction to the ETA model, how it works, and why it might be the right path for aspiring entrepreneurs.',
  'placeholder123',
  '32:15',
  '## Introduction

Entrepreneurship Through Acquisition, or ETA, is a path to business ownership where an entrepreneur acquires an existing company rather than starting one from scratch.

## Why ETA?

Many entrepreneurs are drawn to ETA because it offers several advantages over starting a business from zero:

- **Existing cash flow** - The business already has customers and revenue
- **Proven model** - The product-market fit has been established
- **Infrastructure in place** - Employees, systems, and processes already exist
- **Lower risk** - Historical financials provide clarity on performance

## The ETA Journey

The typical ETA journey involves several key phases:

### 1. Search Phase
This is where you actively look for businesses to acquire. This can take 12-24 months and involves:
- Defining your acquisition criteria
- Building deal flow through brokers, direct outreach, and networking
- Evaluating potential targets

### 2. Due Diligence
Once you find a promising target, you conduct thorough due diligence:
- Financial analysis and Quality of Earnings (QoE)
- Legal review
- Operational assessment
- Customer and employee interviews

### 3. Financing
Most ETA deals are financed through a combination of:
- SBA loans (up to 90% of the purchase price)
- Seller financing
- Equity from the buyer and investors

### 4. Operations
After closing, you become the operator. This is where your leadership and management skills come into play.

## Is ETA Right for You?

ETA is not for everyone. The best candidates typically have:
- Strong leadership and management skills
- Financial acumen
- Tolerance for risk and ambiguity
- The ability to raise capital
- A long-term ownership mindset

## Conclusion

ETA offers a compelling alternative to starting a business from scratch. If you have the right skills and mindset, it can be a faster, lower-risk path to business ownership and wealth creation.',
  'Jed Morris',
  NOW() - INTERVAL '7 days',
  8,
  'Getting Started',
  ARRAY['ETA', 'Entrepreneurship', 'Business Acquisition', 'Beginner'],
  'Learn what Entrepreneurship Through Acquisition (ETA) is and whether it might be the right path for your entrepreneurial journey.',
  true,
  true
),
(
  'How to Choose the Right QoE Provider',
  'how-to-choose-qoe-provider',
  'Quality of Earnings is critical to any acquisition. Learn how to select the right QoE provider for your deal.',
  'placeholder456',
  '28:45',
  '## What is Quality of Earnings?

A Quality of Earnings (QoE) report is a financial analysis that goes beyond the basic financial statements to understand the true economic performance of a business.

## Why QoE Matters

When you are acquiring a business, the seller''s financials tell one story. But are the earnings sustainable? Are there one-time items inflating (or deflating) the numbers? A QoE helps you understand:

- **Normalized EBITDA** - What the business truly earns on a recurring basis
- **Working capital requirements** - How much cash the business needs to operate
- **Revenue quality** - Are customers sticky? Is revenue recurring?
- **Expense normalization** - Owner perks, one-time costs, etc.

## Choosing a QoE Provider

### Experience Matters

Look for providers who have:
- Done deals in your size range
- Experience in your industry
- Worked with search fund or self-funded searchers

### Questions to Ask

1. How many QoE reports have you done in the past year?
2. What is your experience with businesses in my target industry?
3. Can you provide references from other searchers?
4. What is your typical turnaround time?
5. How do you handle scope creep?

### Cost Considerations

QoE reports typically cost:
- **Small deals (<$1M)**: $15,000 - $25,000
- **Medium deals ($1M - $5M)**: $25,000 - $50,000
- **Larger deals (>$5M)**: $50,000+

## Red Flags to Watch For

Be cautious of QoE providers who:
- Have never worked with acquisition entrepreneurs
- Cannot provide relevant references
- Quote unusually low prices
- Have very long turnaround times

## Conclusion

Your QoE provider is a critical partner in your acquisition journey. Take the time to find one who understands your needs and has the experience to deliver insights that matter.',
  'Jed Morris',
  NOW() - INTERVAL '3 days',
  6,
  'Due Diligence',
  ARRAY['QoE', 'Quality of Earnings', 'Due Diligence', 'Financial Analysis'],
  'Learn how to evaluate and select the right Quality of Earnings provider for your business acquisition.',
  true,
  false
),
(
  'SBA Loans Explained: Everything Searchers Need to Know',
  'sba-loans-explained',
  'SBA 7(a) loans are the most common financing for small business acquisitions. Here is everything you need to know.',
  'placeholder789',
  '41:20',
  '## Introduction to SBA Loans

The Small Business Administration (SBA) 7(a) loan program is the most popular financing option for acquiring small businesses. These loans offer favorable terms that make business ownership accessible to more entrepreneurs.

## Key Features of SBA 7(a) Loans

### Loan Amounts
- Maximum loan amount: $5 million
- Typical acquisition loans: $500K - $5M

### Terms
- **Interest rates**: Prime + 2.25% to 2.75% (variable)
- **Loan term**: Up to 10 years for acquisitions
- **Down payment**: Typically 10-20%

### What SBA Loans Cover
- Business acquisition price
- Working capital
- Equipment and inventory
- Real estate (25-year term available)

## The SBA Loan Process

### 1. Pre-Qualification
Work with an SBA lender to understand what you can qualify for based on:
- Your background and experience
- Personal credit score (typically 680+)
- Liquidity and net worth
- The target business''s financials

### 2. Find Your Target
With pre-qualification in hand, you can search confidently knowing your financing parameters.

### 3. Submit a Full Package
Once you have a signed LOI, you''ll submit:
- Personal financial statements
- Tax returns (3 years)
- Resume and background
- Business financials and projections
- Purchase agreement

### 4. Underwriting
The lender reviews everything and may request additional documentation. This typically takes 30-60 days.

### 5. Closing
Once approved, you''ll close the loan alongside your acquisition.

## Tips for Success

1. **Build relationships early** - Talk to lenders before you need them
2. **Keep your finances clean** - Pay down debt, maintain good credit
3. **Be prepared** - Have your documents organized
4. **Communicate proactively** - Keep your lender informed

## Common Mistakes to Avoid

- Waiting too long to engage a lender
- Underestimating the documentation required
- Not understanding the full equity injection requirements
- Choosing a lender who does not specialize in acquisitions

## Conclusion

SBA loans make business acquisition possible for many entrepreneurs who could not otherwise afford to buy a business. Start building lender relationships early in your search.',
  'Jed Morris',
  NOW() - INTERVAL '1 day',
  10,
  'Financing',
  ARRAY['SBA', 'Loans', 'Financing', 'Acquisition Finance', '7(a)'],
  'A comprehensive guide to SBA 7(a) loans for business acquisitions, including terms, process, and tips for success.',
  true,
  true
);
