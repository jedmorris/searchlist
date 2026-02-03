-- Seed categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Legal / M&A Attorneys', 'legal', 'Deal counsel, M&A attorneys, and legal advisors', 'Scale', 1),
('Quality of Earnings', 'qoe', 'Financial due diligence and QofE providers', 'FileSearch', 2),
('Accounting & CPA', 'accounting', 'Small business accountants and tax specialists', 'Calculator', 3),
('SBA Lenders', 'sba-lenders', 'SBA 7(a) lenders and acquisition financing', 'Landmark', 4),
('Business Brokers', 'brokers', 'Sell-side brokers and intermediaries', 'Handshake', 5),
('Insurance', 'insurance', 'R&W, D&O, key person, and business insurance', 'Shield', 6),
('Wealth & Tax Planning', 'wealth-planning', 'Post-acquisition and rollover specialists', 'PiggyBank', 7),
('Consulting', 'consulting', 'Integration, operations, and HR consultants', 'Users', 8);

-- Seed services for each category
-- Legal services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'legal')
FROM (VALUES
  ('M&A Transaction Counsel', 'ma-counsel'),
  ('Due Diligence Review', 'due-diligence'),
  ('Contract Negotiation', 'contract-negotiation'),
  ('LOI Drafting', 'loi-drafting'),
  ('Asset Purchase Agreements', 'apa'),
  ('Employment Agreements', 'employment-agreements'),
  ('Non-Compete Agreements', 'non-compete')
) AS t(name, slug);

-- QoE services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'qoe')
FROM (VALUES
  ('Quality of Earnings Report', 'qoe-report'),
  ('Sell-Side QoE', 'sell-side-qoe'),
  ('Buy-Side QoE', 'buy-side-qoe'),
  ('Working Capital Analysis', 'working-capital'),
  ('Revenue Quality Analysis', 'revenue-quality'),
  ('EBITDA Adjustments', 'ebitda-adjustments')
) AS t(name, slug);

-- Accounting services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'accounting')
FROM (VALUES
  ('Tax Preparation', 'tax-prep'),
  ('Bookkeeping', 'bookkeeping'),
  ('Financial Statements', 'financial-statements'),
  ('Tax Planning', 'tax-planning'),
  ('Payroll Services', 'payroll'),
  ('CFO Services', 'cfo-services')
) AS t(name, slug);

-- SBA Lender services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'sba-lenders')
FROM (VALUES
  ('SBA 7(a) Loans', 'sba-7a'),
  ('SBA 504 Loans', 'sba-504'),
  ('Acquisition Financing', 'acquisition-financing'),
  ('Working Capital Loans', 'working-capital-loans'),
  ('Equipment Financing', 'equipment-financing'),
  ('Seller Financing Coordination', 'seller-financing')
) AS t(name, slug);

-- Broker services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'brokers')
FROM (VALUES
  ('Business Valuation', 'valuation'),
  ('Sell-Side Representation', 'sell-side'),
  ('Buy-Side Search', 'buy-side'),
  ('Deal Sourcing', 'deal-sourcing'),
  ('Confidential Business Sales', 'confidential-sales'),
  ('Business Listing', 'business-listing')
) AS t(name, slug);

-- Insurance services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'insurance')
FROM (VALUES
  ('Representations & Warranties Insurance', 'rw-insurance'),
  ('Directors & Officers Insurance', 'do-insurance'),
  ('Key Person Insurance', 'key-person'),
  ('General Liability', 'general-liability'),
  ('Professional Liability', 'professional-liability'),
  ('Cyber Insurance', 'cyber-insurance')
) AS t(name, slug);

-- Wealth Planning services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'wealth-planning')
FROM (VALUES
  ('401(k) Rollover', '401k-rollover'),
  ('ROBS Setup', 'robs'),
  ('Estate Planning', 'estate-planning'),
  ('Tax Optimization', 'tax-optimization'),
  ('Wealth Management', 'wealth-management'),
  ('Exit Planning', 'exit-planning')
) AS t(name, slug);

-- Consulting services
INSERT INTO services (name, slug, category_id)
SELECT name, slug, (SELECT id FROM categories WHERE slug = 'consulting')
FROM (VALUES
  ('Post-Acquisition Integration', 'integration'),
  ('Operations Consulting', 'operations'),
  ('HR & Staffing', 'hr-staffing'),
  ('Strategic Planning', 'strategic-planning'),
  ('Technology Assessment', 'tech-assessment'),
  ('Process Improvement', 'process-improvement')
) AS t(name, slug);

-- Sample providers (for testing)
INSERT INTO providers (name, slug, company_name, email, tagline, bio, city, state, is_remote, deal_size_min, deal_size_max, years_experience, deals_closed, is_verified, is_featured, is_active)
VALUES
(
  'Sarah Chen',
  'sarah-chen',
  'Chen & Associates, PLLC',
  'sarah@chenlaw.example.com',
  'M&A attorney specializing in lower middle market acquisitions',
  'Sarah Chen is a seasoned M&A attorney with over 15 years of experience helping entrepreneurs acquire and sell businesses in the $500K-$10M range. She understands the unique challenges of search fund and ETA transactions, having closed over 100 deals. Her practical approach focuses on getting deals done efficiently while protecting her clients'' interests.',
  'Austin',
  'Texas',
  true,
  500,
  10000,
  15,
  100,
  true,
  true,
  true
),
(
  'Michael Thompson',
  'michael-thompson',
  'Thompson QoE Partners',
  'michael@thompsonqoe.example.com',
  'Quality of Earnings specialist for SMB acquisitions',
  'Michael Thompson founded Thompson QoE Partners to serve the unique needs of independent sponsors and search fund entrepreneurs. With a background at a Big 4 firm and experience in over 200 QoE engagements, Michael provides thorough but practical financial due diligence reports that lenders and investors trust.',
  'Denver',
  'Colorado',
  true,
  250,
  15000,
  12,
  200,
  true,
  true,
  true
),
(
  'Jennifer Martinez',
  'jennifer-martinez',
  'First Capital SBA Lending',
  'jennifer@firstcapitalsba.example.com',
  'SBA 7(a) lending expert for business acquisitions',
  'Jennifer Martinez leads the acquisition lending team at First Capital, one of the top SBA lenders nationwide. She has helped hundreds of entrepreneurs finance their business acquisitions with creative SBA structures. Jennifer is known for her ability to navigate complex deals and find solutions that work for both buyers and sellers.',
  'Dallas',
  'Texas',
  false,
  500,
  5000,
  10,
  300,
  true,
  false,
  true
),
(
  'David Park',
  'david-park',
  'Park & Williams CPAs',
  'david@parkwilliams.example.com',
  'CPA firm focused on acquisition entrepreneurs',
  'David Park leads a boutique CPA firm dedicated to serving ETA entrepreneurs and their acquired businesses. From pre-acquisition tax planning through post-close integration, David''s team provides comprehensive accounting and tax services tailored to the unique needs of newly acquired businesses.',
  'Seattle',
  'Washington',
  true,
  100,
  5000,
  8,
  75,
  false,
  false,
  true
),
(
  'Amanda Foster',
  'amanda-foster',
  'Foster Insurance Advisors',
  'amanda@fosterinsurance.example.com',
  'Risk management and insurance for M&A transactions',
  'Amanda Foster specializes in insurance solutions for business acquisitions, including representations and warranties insurance, key person coverage, and post-acquisition risk management. Her deep understanding of M&A transactions allows her to identify risks early and structure appropriate coverage.',
  'Chicago',
  'Illinois',
  true,
  1000,
  25000,
  14,
  150,
  true,
  false,
  true
);

-- Link sample providers to categories
INSERT INTO provider_categories (provider_id, category_id)
SELECT p.id, c.id FROM providers p, categories c
WHERE p.slug = 'sarah-chen' AND c.slug = 'legal';

INSERT INTO provider_categories (provider_id, category_id)
SELECT p.id, c.id FROM providers p, categories c
WHERE p.slug = 'michael-thompson' AND c.slug = 'qoe';

INSERT INTO provider_categories (provider_id, category_id)
SELECT p.id, c.id FROM providers p, categories c
WHERE p.slug = 'jennifer-martinez' AND c.slug = 'sba-lenders';

INSERT INTO provider_categories (provider_id, category_id)
SELECT p.id, c.id FROM providers p, categories c
WHERE p.slug = 'david-park' AND c.slug = 'accounting';

INSERT INTO provider_categories (provider_id, category_id)
SELECT p.id, c.id FROM providers p, categories c
WHERE p.slug = 'amanda-foster' AND c.slug = 'insurance';

-- Link providers to some services
INSERT INTO provider_services (provider_id, service_id)
SELECT p.id, s.id FROM providers p, services s
WHERE p.slug = 'sarah-chen' AND s.slug IN ('ma-counsel', 'due-diligence', 'contract-negotiation', 'loi-drafting', 'apa');

INSERT INTO provider_services (provider_id, service_id)
SELECT p.id, s.id FROM providers p, services s
WHERE p.slug = 'michael-thompson' AND s.slug IN ('qoe-report', 'buy-side-qoe', 'working-capital', 'ebitda-adjustments');

INSERT INTO provider_services (provider_id, service_id)
SELECT p.id, s.id FROM providers p, services s
WHERE p.slug = 'jennifer-martinez' AND s.slug IN ('sba-7a', 'acquisition-financing', 'seller-financing');

INSERT INTO provider_services (provider_id, service_id)
SELECT p.id, s.id FROM providers p, services s
WHERE p.slug = 'david-park' AND s.slug IN ('tax-prep', 'tax-planning', 'bookkeeping', 'financial-statements');

INSERT INTO provider_services (provider_id, service_id)
SELECT p.id, s.id FROM providers p, services s
WHERE p.slug = 'amanda-foster' AND s.slug IN ('rw-insurance', 'do-insurance', 'key-person', 'general-liability');
