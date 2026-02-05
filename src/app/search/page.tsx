import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { ProviderGrid } from '@/components/providers/ProviderGrid'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { createClient } from '@/lib/supabase/server'
import type { Category, Provider } from '@/types/database'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams

  return {
    title: q ? `Search: ${q}` : 'Search',
    description: q
      ? `Search results for "${q}" in Search List`
      : 'Search for service providers',
  }
}

// ... imports

async function searchProviders(query: string): Promise<Provider[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .or(
      `name.ilike.%${query}%,company_name.ilike.%${query}%,tagline.ilike.%${query}%,bio.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`
    )
    .order('is_featured', { ascending: false })
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(20)

  if (error) {
    console.error('Search error:', error)
    return []
  }

  return data || []
}

async function searchCategories(query: string): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('display_order')

  if (error) {
    console.error('Category search error:', error)
    return []
  }

  return data || []
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: query } = await searchParams

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Search Search List</h1>
          <p className="text-muted-foreground">
            Enter a search term to find service providers, categories, or
            locations.
          </p>
        </div>
      </div>
    )
  }

  const [providers, categories] = await Promise.all([
    searchProviders(query),
    searchCategories(query),
  ])

  const hasResults = providers.length > 0 || categories.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Search</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Search results for &quot;{query}&quot;
        </h1>
        {hasResults ? (
          <p className="text-muted-foreground">
            Found {providers.length}{' '}
            {providers.length === 1 ? 'provider' : 'providers'}
            {categories.length > 0 && ` and ${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
          </p>
        ) : (
          <p className="text-muted-foreground">No results found</p>
        )}
      </div>

      {!hasResults ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No matches found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Try adjusting your search terms or browse our categories to find what
            you&apos;re looking for.
          </p>
          <Link
            href="/#categories"
            className="text-primary hover:underline font-medium"
          >
            Browse all categories
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Categories */}
          {categories.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}

          {/* Providers */}
          {providers.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Providers</h2>
              <ProviderGrid providers={providers} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
