import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProviderProfile } from '@/components/providers/ProviderProfile'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Provider, Category, Service } from '@/types/database'

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

  const [categories, services] = await Promise.all([
    getProviderCategories(provider.id),
    getProviderServices(provider.id),
  ])

  const primaryCategory = categories[0]

  return (
    <div className="container mx-auto px-4 py-8">
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
      />
    </div>
  )
}
