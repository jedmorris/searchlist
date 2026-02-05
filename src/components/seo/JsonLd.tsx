import type { Provider, Category, Review } from '@/types/database'
import { SITE_CONFIG } from '@/lib/constants'

interface OrganizationJsonLdProps {
  name?: string
  url?: string
  logo?: string
  description?: string
}

export function OrganizationJsonLd({
  name = SITE_CONFIG.name,
  url = SITE_CONFIG.url,
  logo = `${SITE_CONFIG.url}/logo.png`,
  description = SITE_CONFIG.description,
}: OrganizationJsonLdProps = {}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface WebsiteJsonLdProps {
  name?: string
  url?: string
  description?: string
}

export function WebsiteJsonLd({
  name = SITE_CONFIG.name,
  url = SITE_CONFIG.url,
  description = SITE_CONFIG.description,
}: WebsiteJsonLdProps = {}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface LocalBusinessJsonLdProps {
  provider: Provider
  reviews?: Review[]
}

export function LocalBusinessJsonLd({ provider, reviews = [] }: LocalBusinessJsonLdProps) {
  const approvedReviews = reviews.filter((r) => r.is_approved)
  const hasReviews = approvedReviews.length > 0

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: provider.company_name || provider.name,
    description: provider.tagline || provider.bio,
    url: `${SITE_CONFIG.url}/provider/${provider.slug}`,
    ...(provider.headshot_url && { image: provider.headshot_url }),
    ...(provider.email && { email: provider.email }),
    ...(provider.phone && { telephone: provider.phone }),
    ...(provider.website && { sameAs: [provider.website] }),
  }

  // Add address if location is available
  if (provider.city || provider.state) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(provider.city && { addressLocality: provider.city }),
      ...(provider.state && { addressRegion: provider.state }),
      addressCountry: 'US',
    }
  }

  // Add aggregate rating if reviews exist
  if (hasReviews && provider.rating_average && provider.rating_count) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: provider.rating_average.toFixed(1),
      reviewCount: provider.rating_count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  // Add individual reviews (up to 5)
  if (approvedReviews.length > 0) {
    jsonLd.review = approvedReviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author_name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.content,
      datePublished: review.created_at,
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string
    href: string
  }>
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FAQPageJsonLdProps {
  questions: Array<{
    question: string
    answer: string
  }>
}

export function FAQPageJsonLd({ questions }: FAQPageJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ItemListJsonLdProps {
  name: string
  description?: string
  items: Array<{
    name: string
    url: string
    position: number
  }>
}

export function ItemListJsonLd({ name, description, items }: ItemListJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
