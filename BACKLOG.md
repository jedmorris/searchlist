# Search List - Feature Backlog

## Current State Summary

### Completed Features
- [x] Public directory homepage with featured providers
- [x] Category browsing with provider counts
- [x] Provider profiles with full details
- [x] Full-text search with ranking
- [x] Advanced filtering (location, deal size, remote, services)
- [x] Inquiry form for contacting providers
- [x] Admin authentication & dashboard
- [x] Provider CRUD management
- [x] Inquiry management with status tracking
- [x] Admin user management
- [x] Category & Service management
- [x] Analytics dashboard
- [x] CSV export functionality
- [x] Image uploads (Supabase Storage)
- [x] **Provider Self-Service Portal** (dashboard, profile editing, inquiry viewing)
- [x] **Review/Rating System** (submit, moderate, display on profiles)
- [x] **Role-based Auth** (admin, provider, user roles)
- [x] **Provider Invitations** (admin invites, acceptance flow)
- [x] **Stripe Billing** (subscriptions, tiers, webhook handling)
- [x] **Search Autocomplete** component
- [x] **Search Filters** component
- [x] **Quiz/Matching Tool** (multi-step quiz, provider matching, lead capture, admin dashboard)
- [x] **Email Notifications** (inquiries, reviews, invitations, quiz leads)
- [x] **Homepage Testimonials** (displays approved reviews with social proof)
- [x] **Top Rated / Most Reviewed Sections** (tabbed display of top providers)
- [x] **Enhanced Provider Cards** (featured review quotes on cards)
- [x] **Industry Subcategories** (industry specializations for providers with filtering)
- [x] **Advanced Search Filters** (rating, reviews, verified, remote, industry, sort options)

---

## Comparison: Search List vs Sam's List

| Feature | Search List | Sam's List | Gap |
|---------|---------------|------------|-----|
| Provider Directory | Yes | Yes | - |
| Category Browsing | Yes | Yes | - |
| State/Location Filter | Yes | Yes | - |
| Search | Full-text + Filters | Advanced | - |
| Provider Profiles | Yes | Yes | - |
| Review System | Yes | Yes | - |
| Featured Providers | Yes | Yes | - |
| Inquiry/Contact Form | Yes | Yes | - |
| Provider Portal | Yes | Yes | - |
| Admin Panel | Yes | Yes | - |
| Billing/Subscriptions | Yes | Yes | - |
| Quiz/Matching Tool | Yes | Yes | - |
| Homepage Testimonials | Yes | Yes | - |
| "Most Reviewed" Sections | Yes | Yes | - |
| Blog/Content | Yes | Yes | - |
| FAQ Page | Yes | Yes | - |
| Industry Subcategories | Yes | Yes | - |
| Email Notifications | Yes | Likely | - |
| Provider Count Display | Yes | Yes | - |
| Saved Providers | Yes | Yes | - |
| SEO/Structured Data | Yes | Likely | - |

---

## Prioritized Backlog

### P1: High Impact - Core Functionality
*Direct impact on user acquisition and conversion*

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 1.1 | Homepage Testimonials Section | High | Low | **Complete** |
| 1.2 | "Most Reviewed" / "Top Rated" Sections | High | Low | **Complete** |
| 1.3 | Email Notifications System | High | Medium | **Complete** |
| 1.4 | Enhanced Provider Cards (review quotes) | High | Low | **Complete** |
| 1.5 | Quiz/Matching Tool | Very High | High | **Complete** |

#### 1.1 Homepage Testimonials Section ✅ COMPLETE
Display recent approved reviews on homepage with reviewer name, provider name, rating, and quote. Builds immediate trust and social proof.

**Implemented:**
- TestimonialsSection component with beautiful card design
- Fetches 4+ star approved reviews from database
- Shows rating stars, review quote, author name
- Links to provider profile
- Prioritizes featured reviews
- Responsive 3-column grid layout

#### 1.2 "Most Reviewed" / "Top Rated" Sections ✅ COMPLETE
Add sections to homepage and category pages showing providers sorted by review count/rating. Helps users find proven providers.

**Implemented:**
- TopProvidersSection component with tabbed interface
- "Top Rated" tab - sorted by highest rating (min 1 review)
- "Most Reviewed" tab - sorted by review count
- Rank badges (gold #1, silver #2, bronze #3)
- Provider cards with rating stars, review count, categories
- Responsive 3-column grid layout
- Empty state handling when no reviewed providers

#### 1.3 Email Notifications System ✅ COMPLETE
- Notify providers of new inquiries (critical!)
- Notify providers of new reviews
- Auto-send invitation emails
- Weekly activity digest
- Uses existing Resend integration

**Implemented:**
- Centralized email library (`src/lib/email/`)
- Beautiful HTML email templates with consistent branding
- Inquiry notifications to providers and admins
- Review submission notifications (provider + admin)
- Review approval notifications to reviewers
- Provider invitation emails with accept link
- Quiz lead admin notifications
- Environment variables: `RESEND_API_KEY`, `ADMIN_EMAIL`, `EMAIL_FROM`

#### 1.4 Enhanced Provider Cards ✅ COMPLETE
Show review count and a short testimonial quote on provider cards. More compelling than just star ratings.

**Implemented:**
- FeaturedReview type in ProviderCard component
- Review quotes displayed instead of tagline when available
- Truncated to 100 characters with ellipsis
- Shows author name attribution
- `getFeaturedReviewsForProviders` utility function
- `addFeaturedReviewsToProviders` helper for batch fetching
- Prioritizes: featured reviews > highest rated > most recent
- Updated search and category pages to include featured reviews

#### 1.5 Quiz/Matching Tool ✅ COMPLETE
Multi-step quiz asking about needs, budget, location, industry. Matches users to top 3-5 relevant providers.

**Implemented:**
- 5-step quiz wizard (Services, Deal Size, Location, Timeline, Contact)
- PostgreSQL matching algorithm with scoring
- Quiz results page with matched providers
- Lead capture and storage
- Admin quiz leads dashboard
- Homepage CTA integration
- Navigation link

---

### P2: Improve Discovery & Navigation

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 2.1 | Industry/Specialty Subcategories | Medium-High | Medium | **Complete** |
| 2.2 | Advanced Search Filters UI | Medium | Low | **Complete** |
| 2.3 | Improved Pagination | Medium | Low | Backlog |
| 2.4 | Related Providers on Profile | Medium | Medium | Backlog |

#### 2.1 Industry/Specialty Subcategories ✅ COMPLETE
Add industry tags (Tech, Healthcare, Real Estate, etc.). New `industries` table + `provider_industries` junction. Filter by multiple dimensions.

**Implemented:**
- `industries` table with name, slug, description, icon, display_order
- `provider_industries` junction table
- Industry type definitions in database.ts
- Admin Industries management page (`/admin/industries`)
- API routes: `/api/industries`, `/api/industries/[id]`, `/api/industries/counts`
- Industry selection in ProviderForm (admin and portal)
- Industry filtering in FilterSidebar component
- Industries displayed on provider profile page
- Provider API routes updated to handle industry_ids

#### 2.2 Advanced Search Filters UI ✅ COMPLETE
Add minimum rating filter, "has reviews" filter, industry filter. Sort by: Relevance, Rating, Review Count, Newest.

**Implemented:**
- `SearchFilters` component with responsive design (mobile sheet, desktop inline)
- Sort options: Relevance, Highest Rated, Most Reviews, Newest
- Minimum rating filter (4+, 3+, 2+ stars)
- "Has reviews" checkbox filter
- "Verified only" checkbox filter
- "Remote-friendly" checkbox filter
- Industry multi-select filter
- Active filters displayed as removable badges
- Clear all filters button
- Filter count badge on mobile trigger
- Search page updated to apply all filters server-side

#### 2.3 Improved Pagination
Show "1-20 of 156 results", page numbers (not just next/prev), consider infinite scroll.

#### 2.4 Related Providers
Show "Similar Providers" on profile page based on category, location, services.

---

### P3: Content & SEO

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 3.1 | Blog/Resources Section | Medium | Medium | **Complete** |
| 3.2 | FAQ Page | Low-Medium | Low | **Complete** |
| 3.3 | SEO Optimizations | Medium | Low | **Complete** |
| 3.4 | Provider Case Studies | Medium | Medium | Backlog |

#### 3.1 Blog/Resources Section ✅ COMPLETE
Create `/blog` with articles about ETA, due diligence, choosing advisors. Improves SEO.

**Implemented:**
- Blog listing page (`/blog`) with featured episode and episode grid
- Individual blog post pages (`/blog/[slug]`) with:
  - YouTube video embed with lazy loading
  - Transcript/article content below video
  - Author info, reading time, video duration
  - Tags and category badges
  - Related posts section
  - CTA to quiz and provider browsing
- Admin blog management (`/admin/blog`):
  - Create, edit, delete blog posts
  - Publish/unpublish and feature toggle
  - Rich form with markdown content editor
  - YouTube video preview from video ID
  - Category and tag management
  - SEO fields (meta title, description)
- Database: `blog_posts` table with full schema
- Components: VideoEmbed, ArticleContent, BlogPostCard, BlogPostForm
- SEO: Article schema markup on individual posts
- Navigation: Blog link added to header and admin sidebar
- Designed for "Still Searching with Jed Morris" podcast format

#### 3.2 FAQ Page ✅ COMPLETE
Common questions for buyers/sellers and providers. Reduces support burden.

**Implemented:**
- `/faq` page with 4 organized sections (Buyers, Providers, ETA Info, Technical)
- Accordion UI for expandable Q&A
- FAQ schema markup (JSON-LD) for SEO
- Breadcrumb navigation
- Contact support CTA
- Added FAQ link to site navigation

#### 3.3 SEO Optimizations ✅ COMPLETE
Add JSON-LD structured data, review schema markup, improved meta descriptions, sitemap.

**Implemented:**
- JSON-LD components: OrganizationJsonLd, WebsiteJsonLd, LocalBusinessJsonLd, FAQPageJsonLd, BreadcrumbJsonLd, ItemListJsonLd
- Sitemap generation (`/sitemap.xml`) with all pages, categories, and providers
- Robots.txt configuration with sitemap reference
- Provider pages include review schema with aggregate ratings
- Homepage includes Organization and Website structured data
- FAQ page includes FAQPage schema for rich snippets

#### 3.4 Provider Case Studies
Dedicated pages for top providers with in-depth profiles. Premium feature for higher tiers.

---

### P4: Provider Experience

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 4.1 | Provider Analytics Dashboard | Medium | Medium | Backlog |
| 4.2 | Portal Onboarding Flow | Medium | Low | Backlog |
| 4.3 | Inquiry Response Templates | Low-Medium | Low | Backlog |
| 4.4 | Provider Badges/Achievements | Low | Low | Backlog |

#### 4.1 Provider Analytics Dashboard
Profile views, inquiry conversion rate, search impressions, category comparison. Valuable for paid tiers.

#### 4.2 Portal Onboarding Flow
Guided setup for new providers, profile completion %, tips to improve visibility. `/portal/setup` referenced but not implemented.

#### 4.3 Inquiry Response Templates
Pre-written templates for quick replies from portal.

#### 4.4 Provider Badges
"Quick Responder", "Top Rated", "5+ Reviews" badges. Gamification for engagement.

---

### P5: Platform Growth

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 5.1 | Provider Referral Program | Medium | Medium | Backlog |
| 5.2 | Client Accounts | Medium | High | Backlog |
| 5.3 | In-App Messaging | Medium | High | Backlog |
| 5.4 | Mobile App | Low-Medium | Very High | Future |

---

### P6: Monetization

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 6.1 | Activate Feature Boosts | Medium | Low | Backlog |
| 6.2 | Lead Quality Scoring | Medium | Medium | Backlog |
| 6.3 | Competitive Insights | Low-Medium | Medium | Backlog |

#### 6.1 Activate Feature Boosts
Enable boost purchase buttons (currently "Coming Soon"). Spotlight, Homepage Feature, Category Boost.

---

### P7: New Recommendations (Added Feb 2026)

| # | Feature | Impact | Effort | Status |
|---|---------|--------|--------|--------|
| 7.1 | Provider Comparison Tool | High | Medium | Backlog |
| 7.2 | Saved Providers / Favorites | Medium-High | Low | **Complete** |
| 7.3 | Provider Availability Calendar | Medium | Medium | Backlog |
| 7.4 | Review Response System | Medium | Low | Backlog |
| 7.5 | Weekly Digest Emails | Medium | Low | Backlog |
| 7.6 | Provider Verification Badges | Medium | Low | Backlog |
| 7.7 | Deal Flow Tracking | High | High | Backlog |
| 7.8 | Provider API/Embed Widget | Medium | Medium | Backlog |

#### 7.1 Provider Comparison Tool
Side-by-side comparison of 2-4 providers. Compare deal size ranges, services, ratings, location, experience. Common in B2B directories.

#### 7.2 Saved Providers / Favorites ✅ COMPLETE
Allow users to save providers to a list (localStorage or auth-gated). Quick shortlist for later inquiry. Very common UX pattern.

**Implemented:**
- SavedProvidersContext with localStorage persistence
- SaveButton component with heart icon (hover reveal on cards)
- `/saved` page to view all saved providers
- Batch API endpoint (`/api/providers/batch`) for fetching multiple providers
- "Saved" link in navigation header
- Clear all functionality
- Empty state with CTA to browse providers

#### 7.3 Provider Availability Calendar
Providers can indicate their current availability/capacity. Shows "Taking new clients" vs "Booked until Q2" status. Helps users avoid dead-end inquiries.

#### 7.4 Review Response System
Let providers respond to reviews publicly. Common on Google/Yelp. Builds trust and engagement. Shows providers are active.

#### 7.5 Weekly Digest Emails
Automated weekly email to admins with: new inquiries, new reviews, new quiz leads, provider signups. Keeps admins engaged without checking dashboard.

#### 7.6 Provider Verification Badges
Multiple badge types: "Identity Verified", "Background Checked", "Client Verified" (has completed deals). Tiered trust signals beyond basic verification.

#### 7.7 Deal Flow Tracking
For premium providers: track deals from inquiry → intro call → engaged → closed. CRM-lite functionality. High value for paid tiers.

#### 7.8 Provider API/Embed Widget
Let providers embed their Search List profile/reviews on their own website. Widget shows rating, review count, "View on Search List" link. Free marketing.

---

## Suggested Implementation Roadmap

### ✅ COMPLETED PHASES

#### Phase 1: Core Features (DONE)
- [x] 1.1 Homepage Testimonials Section
- [x] 1.2 "Most Reviewed" / "Top Rated" Sections
- [x] 1.3 Email Notifications System
- [x] 1.4 Enhanced Provider Cards with Review Quotes
- [x] 1.5 Quiz/Matching Tool
- [x] 2.1 Industry/Specialty Subcategories
- [x] 2.2 Advanced Search Filters UI

---

### ✅ COMPLETED PHASE 2

#### Phase 2: Quick Wins & Polish (DONE)
- [x] 3.2 FAQ Page *(closes competitive gap)*
- [x] 3.3 SEO Optimizations *(JSON-LD, sitemap)*
- [x] 7.2 Saved Providers / Favorites *(high UX value)*

---

### ✅ COMPLETED PHASE 3

#### Phase 3: Content (DONE)
- [x] 3.1 Blog/Resources Section *(closes last competitive gap)*

---

### 🎯 RECOMMENDED NEXT PHASE

#### Phase 4: Engagement & Revenue (Recommended)
- [ ] 2.3 Improved Pagination
- [ ] 4.2 Portal Onboarding Flow
- [ ] 6.1 Activate Feature Boosts *(revenue)*
- [ ] 7.4 Review Response System
- [ ] 7.5 Weekly Digest Emails

#### Phase 5: Enhanced Discovery
- [ ] 2.4 Related Providers
- [ ] 4.1 Provider Analytics Dashboard
- [ ] 7.1 Provider Comparison Tool

#### Phase 6: Premium Features
- [ ] 7.7 Deal Flow Tracking
- [ ] 7.3 Provider Availability Calendar
- [ ] 5.2 Client Accounts

#### Phase 6: Future / Scale
- [ ] 5.3 In-App Messaging
- [ ] 7.8 Provider API/Embed Widget
- [ ] 3.4 Provider Case Studies
- [ ] 5.1 Provider Referral Program

---

## Technical Debt

- [x] ~~Email integration for invitations~~ (Complete)
- [ ] `/portal/setup` page (referenced in middleware, not implemented)
- [x] ~~Review notification to providers~~ (Complete)
- [ ] Stripe price IDs configuration & documentation
- [ ] Add environment variable documentation (.env.example)
- [ ] Error boundaries and fallback UI
- [ ] Comprehensive test coverage
- [ ] Database query optimization & caching

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Email:** Resend
- **UI:** shadcn/ui + Tailwind CSS
- **Hosting:** Vercel

---

*Last Updated: February 2026*
