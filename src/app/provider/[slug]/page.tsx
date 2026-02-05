import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProviderProfile } from '@/components/providers/ProviderProfile'
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Provider, Category, Service, Review, Industry } from '@/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProvider(slug: string): Promise<Provider | null> {
  const supabase = await createClient()

  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return provider as Provider
}

async function getProviderCategories(providerId: string): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_categories')
    .select('categories(*)')
    .eq('provider_id', providerId)

  if (error || !data) return []
  return data.map((d: { categories: Category | null }) => d.categories).filter(Boolean) as Category[]
}

async function getProviderServices(providerId: string): Promise<Service[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_services')
    .select('services(*)')
    .eq('provider_id', providerId)

  if (error || !data) return []
  return data.map((d: { services: Service | null }) => d.services).filter(Boolean) as Service[]
}

async function getProviderIndustries(providerId: string): Promise<Industry[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('provider_industries') as any)
    .select('industries(*)')
    .eq('provider_id', providerId)

  if (error || !data) return []
  return data.map((d: { industries: Industry | null }) => d.industries).filter(Boolean) as Industry[]
}

async function getProviderReviews(providerId: string): Promise<{
  reviews: Review[]
  ratingDistribution: Record<number, number>
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !data) return { reviews: [], ratingDistribution: {} }

  // Calculate rating distribution
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  data.forEach((review: Review) => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
  })

  return { reviews: data as Review[], ratingDistribution }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    return { title: 'Provider Not Found' }
  }

  return {
    title: provider.company_name
      ? `${provider.name} - ${provider.company_name}`
      : provider.name,
    description:
      provider.tagline ||
      `Connect with ${provider.name} for your business acquisition needs`,
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    notFound()
  }

  const [categories, services, industries, reviewsData] = await Promise.all([
    getProviderCategories(provider.id),
    getProviderServices(provider.id),
    getProviderIndustries(provider.id),
    getProviderReviews(provider.id),
  ])

  const primaryCategory = categories[0]

  // Build breadcrumb items for JSON-LD
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, href: `/${primaryCategory.slug}` }]
      : []),
    { name: provider.name, href: `/provider/${provider.slug}` },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <LocalBusinessJsonLd provider={provider} reviews={reviewsData.reviews} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        {primaryCategory && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${primaryCategory.slug}`} className="hover:text-primary">
              {primaryCategory.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{provider.name}</span>
      </nav>

      <ProviderProfile
        provider={provider}
        categories={categories}
        services={services}
        industries={industries}
        reviews={reviewsData.reviews}
        ratingDistribution={reviewsData.ratingDistribution}
      />
    </div>
  )
}
