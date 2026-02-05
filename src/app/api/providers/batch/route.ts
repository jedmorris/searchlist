import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addFeaturedReviewsToProviders } from '@/lib/providers/reviews'
import type { Provider, Category } from '@/types/database'

interface ProviderCategory {
  provider_id: string
  categories: Category | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ providers: [] })
  }

  const ids = idsParam.split(',').filter(Boolean)

  if (ids.length === 0) {
    return NextResponse.json({ providers: [] })
  }

  // Limit to prevent abuse
  if (ids.length > 50) {
    return NextResponse.json(
      { error: 'Too many IDs requested' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Fetch providers
  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .in('id', ids)
    .eq('is_active', true)

  if (error) {
    console.error('Batch fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }

  const providerData = (providers || []) as Provider[]
  const providerIds = providerData.map((p) => p.id)

  // Fetch categories for each provider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: providerCategories } = await (supabase as any)
    .from('provider_categories')
    .select(`
      provider_id,
      categories (*)
    `)
    .in('provider_id', providerIds)

  // Build category map
  const categoryMap = new Map<string, Category[]>()
  const pcData = (providerCategories || []) as ProviderCategory[]
  pcData.forEach((pc) => {
    if (pc.categories) {
      const existing = categoryMap.get(pc.provider_id) || []
      categoryMap.set(pc.provider_id, [...existing, pc.categories])
    }
  })

  // Add categories to providers
  const providersWithCategories = providerData.map((provider) => ({
    ...provider,
    categories: categoryMap.get(provider.id) || [],
  }))

  // Add featured reviews
  const providersWithReviews = await addFeaturedReviewsToProviders(providersWithCategories)

  return NextResponse.json({ providers: providersWithReviews })
}
