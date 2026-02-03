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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = await createClient()

  try {
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

    const providers = (providersData || []) as ProviderResult[]

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
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}
