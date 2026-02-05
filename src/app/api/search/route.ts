import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CategoryResult {
  id: string
  name: string
  slug: string
}

interface ProviderResult {
  id: string
  name: string
  slug: string
  company_name: string | null
  tagline: string | null
  city: string | null
  state: string | null
  is_remote: boolean
  is_verified: boolean
  is_featured: boolean
  headshot_url: string | null
  rating_average: number | null
  rating_count: number
  rank: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const state = searchParams.get('state')
  const minDeal = searchParams.get('minDeal')
  const maxDeal = searchParams.get('maxDeal')
  const remote = searchParams.get('remote') === 'true'
  const verified = searchParams.get('verified') === 'true'
  const featured = searchParams.get('featured') === 'true'
  const minRating = searchParams.get('minRating')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const mode = searchParams.get('mode') || 'full' // 'full' or 'quick'

  const supabase = await createClient()

  try {
    // Quick mode: simple search for autocomplete
    if (mode === 'quick') {
      if (!query || query.length < 2) {
        return NextResponse.json({ results: [] })
      }

      // Search categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .ilike('name', `%${query}%`)
        .limit(3)

      const categories = (categoriesData || []) as CategoryResult[]

      // Search providers using full-text search
      const { data: providersData } = await supabase
        .from('providers')
        .select('id, name, slug, company_name, tagline')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,tagline.ilike.%${query}%`)
        .limit(5)

      const providers = (providersData || []) as { id: string; name: string; slug: string; company_name: string | null; tagline: string | null }[]

      const results = [
        ...categories.map((c) => ({
          type: 'category' as const,
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
        ...providers.map((p) => ({
          type: 'provider' as const,
          id: p.id,
          name: p.name,
          slug: p.slug,
          subtitle: p.company_name || p.tagline,
        })),
      ]

      return NextResponse.json({ results })
    }

    // Full mode: use the search_providers function for ranked results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('search_providers', {
      search_query: query || null,
      category_filter: category || null,
      state_filter: state || null,
      min_deal_size: minDeal ? parseInt(minDeal) : null,
      max_deal_size: maxDeal ? parseInt(maxDeal) : null,
      remote_only: remote,
      verified_only: verified,
      featured_only: featured,
      min_rating: minRating ? parseFloat(minRating) : null,
      result_limit: limit,
      result_offset: offset,
    })

    if (error) {
      console.error('Search error:', error)
      // Fallback to simple search if RPC fails
      return fallbackSearch(supabase, query, limit, offset)
    }

    // Get categories for each provider
    const providerIds = (data || []).map((p: ProviderResult) => p.id)

    let providerCategories: Record<string, CategoryResult[]> = {}

    if (providerIds.length > 0) {
      const { data: categoriesData } = await supabase
        .from('provider_categories')
        .select('provider_id, categories(id, name, slug)')
        .in('provider_id', providerIds)

      if (categoriesData) {
        providerCategories = categoriesData.reduce((acc: Record<string, CategoryResult[]>, pc: { provider_id: string; categories: CategoryResult | null }) => {
          if (pc.categories) {
            if (!acc[pc.provider_id]) {
              acc[pc.provider_id] = []
            }
            acc[pc.provider_id].push(pc.categories)
          }
          return acc
        }, {})
      }
    }

    const providers = (data || []).map((p: ProviderResult) => ({
      ...p,
      categories: providerCategories[p.id] || [],
    }))

    return NextResponse.json({
      providers,
      total: providers.length,
      hasMore: providers.length === limit,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ providers: [], error: 'Search failed' }, { status: 500 })
  }
}

async function fallbackSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string | null,
  limit: number,
  offset: number
) {
  let providerQuery = supabase
    .from('providers')
    .select('id, name, slug, company_name, tagline, city, state, is_remote, is_verified, is_featured, headshot_url, rating_average, rating_count')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating_average', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (query && query.length >= 2) {
    providerQuery = providerQuery.or(
      `name.ilike.%${query}%,company_name.ilike.%${query}%,tagline.ilike.%${query}%,bio.ilike.%${query}%`
    )
  }

  const { data, error } = await providerQuery

  if (error) {
    return NextResponse.json({ providers: [], error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    providers: data || [],
    total: data?.length || 0,
    hasMore: data?.length === limit,
  })
}
