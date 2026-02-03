import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ProviderGrid } from '@/components/providers/ProviderGrid'
import { FilterSidebar } from '@/components/providers/FilterSidebar'
import { createClient } from '@/lib/supabase/server'
import { US_STATES } from '@/lib/constants'
import type { Metadata } from 'next'
import type { Provider, Category, Service } from '@/types/database'

interface PageProps {
  params: Promise<{ category: string; state: string }>
  searchParams: Promise<{
    dealMin?: string
    dealMax?: string
    remote?: string
    services?: string
  }>
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Category
}

async function getServices(categoryId: string): Promise<Service[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', categoryId)
    .order('name')

  if (error || !data) return []
  return data as Service[]
}

function getStateName(stateSlug: string): string | null {
  const state = US_STATES.find((s) => s.value === stateSlug)
  return state?.label || null
}

async function getProviders(
  categoryId: string,
  stateName: string,
  filters: {
    dealMin?: string
    dealMax?: string
    remote?: string
    services?: string
  }
) {
  const supabase = await createClient()

  // Get provider IDs for this category
  const { data: providerCategories, error: pcError } = await supabase
    .from('provider_categories')
    .select('provider_id')
    .eq('category_id', categoryId)

  if (pcError || !providerCategories || !providerCategories.length) return []

  const providerIds = providerCategories.map((pc: { provider_id: string }) => pc.provider_id)

  // Build providers query with state filter
  let query = supabase
    .from('providers')
    .select('*')
    .in('id', providerIds)
    .eq('is_active', true)
    .ilike('state', stateName)
    .order('is_featured', { ascending: false })
    .order('is_verified', { ascending: false })
    .order('name')

  // Apply filters
  if (filters.dealMin) {
    query = query.gte('deal_size_max', parseInt(filters.dealMin))
  }
  if (filters.dealMax) {
    query = query.lte('deal_size_min', parseInt(filters.dealMax))
  }
  if (filters.remote === 'true') {
    query = query.eq('is_remote', true)
  }

  const { data: providers, error } = await query

  if (error || !providers) return []

  // Filter by services if specified
  let filteredProviders: Provider[] = providers as Provider[]
  if (filters.services) {
    const servicesSlugs = filters.services.split(',').filter(Boolean)
    if (servicesSlugs.length > 0) {
      const { data: servicesData } = await supabase
        .from('services')
        .select('id')
        .in('slug', servicesSlugs)

      if (servicesData && servicesData.length > 0) {
        const serviceIds = servicesData.map((s: { id: string }) => s.id)

        const { data: providerServices } = await supabase
          .from('provider_services')
          .select('provider_id')
          .in('service_id', serviceIds)

        if (providerServices) {
          const providerIdsWithServices = new Set(
            providerServices.map((ps: { provider_id: string }) => ps.provider_id)
          )
          filteredProviders = filteredProviders.filter((p) =>
            providerIdsWithServices.has(p.id)
          )
        }
      }
    }
  }

  return filteredProviders
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, state: stateSlug } = await params
  const category = await getCategory(categorySlug)
  const stateName = getStateName(stateSlug)

  if (!category || !stateName) {
    return { title: 'Not Found' }
  }

  return {
    title: `${category.name} in ${stateName}`,
    description: `Find ${category.name} in ${stateName} for your business acquisition`,
  }
}

export default async function StateFilteredCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category: categorySlug, state: stateSlug } = await params
  const filters = await searchParams
  const category = await getCategory(categorySlug)
  const stateName = getStateName(stateSlug)

  if (!category || !stateName) {
    notFound()
  }

  const [services, providers] = await Promise.all([
    getServices(category.id),
    getProviders(category.id, stateName, filters),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/${categorySlug}`} className="hover:text-primary">
          {category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{stateName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category.name} in {stateName}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {providers.length} {providers.length === 1 ? 'provider' : 'providers'} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar
              categorySlug={categorySlug}
              services={services}
              currentState={stateSlug}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="mt-6">
                  <FilterSidebar
                    categorySlug={categorySlug}
                    services={services}
                    currentState={stateSlug}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <ProviderGrid providers={providers} />
        </div>
      </div>
    </div>
  )
}
