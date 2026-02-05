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
| Category Browsing | Yes | Yes | Less subcategories |
| State/Location Filter | Yes | Yes | - |
| Search | Full-text + Filters | Advanced | - |
| Provider Profiles | Yes | Yes | - |
| Review System | Yes | Yes | Need better surfacing |
| Featured Providers | Yes | Yes | - |
| Inquiry/Contact Form | Yes | Yes | - |
| Provider Portal | Yes | Yes | - |
| Admin Panel | Yes | Yes | - |
| Billing/Subscriptions | Yes | Yes | - |
| Quiz/Matching Tool | Yes | Yes | - |
| Homepage Testimonials | Yes | Yes | - |
| "Most Reviewed" Sections | Yes | Yes | - |
| Blog/Content | No | Yes | Gap |
| FAQ Page | No | Yes | Gap |
| Industry Subcategories | Yes | Yes | - |
| Email Notifications | Yes | Likely | - |
| Provider Count Display | Yes | Yes | - |

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
| 3.1 | Blog/Resources Section | Medium | Medium | Backlog |
| 3.2 | FAQ Page | Low-Medium | Low | Backlog |
| 3.3 | SEO Optimizations | Medium | Low | Backlog |
| 3.4 | Provider Case Studies | Medium | Medium | Backlog |

#### 3.1 Blog/Resources Section
Create `/blog` with articles about ETA, due diligence, choosing advisors. Improves SEO.

#### 3.2 FAQ Page
Common questions for buyers/sellers and providers. Reduces support burden.

#### 3.3 SEO Optimizations
Add JSON-LD structured data, review schema markup, improved meta descriptions, sitemap.

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

## Suggested Implementation Roadmap

### Phase 1: Quick Wins (1-2 weeks)
- [ ] 1.1 Homepage Testimonials Section
- [ ] 1.2 "Most Reviewed" Sections
- [x] 1.4 Enhanced Provider Cards with Review Quotes
- [ ] 2.3 Improved Pagination
- [ ] 3.2 FAQ Page

### Phase 2: Core Improvements (3-4 weeks)
- [ ] 1.3 Email Notifications System
- [ ] 2.1 Industry/Specialty Subcategories
- [ ] 2.2 Advanced Search Filters UI
- [ ] 4.2 Portal Onboarding Flow
- [ ] 6.1 Activate Feature Boosts

### Phase 3: Major Features (6-8 weeks)
- [ ] 1.5 Quiz/Matching Tool
- [ ] 2.4 Related Providers
- [ ] 4.1 Provider Analytics Dashboard
- [ ] 3.1 Blog/Resources Section

### Phase 4: Future
- [ ] 5.2 Client Accounts
- [ ] 5.3 In-App Messaging
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
