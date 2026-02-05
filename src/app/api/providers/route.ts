import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      company_name,
      email,
      phone,
      website,
      linkedin,
      headshot_url,
      logo_url,
      tagline,
      bio,
      city,
      state,
      is_remote,
      deal_size_min,
      deal_size_max,
      years_experience,
      deals_closed,
      is_verified,
      is_featured,
      is_active,
      category_ids,
      service_ids,
      industry_ids,
    } = body

    if (!name || !slug || !email) {
      return NextResponse.json(
        { message: 'Name, slug, and email are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: provider, error: providerError } = await (supabase.from('providers') as any)
      .insert({
        name,
        slug,
        company_name: company_name || null,
        email,
        phone: phone || null,
        website: website || null,
        linkedin: linkedin || null,
        headshot_url: headshot_url || null,
        logo_url: logo_url || null,
        tagline: tagline || null,
        bio: bio || null,
        city: city || null,
        state: state || null,
        is_remote: is_remote || false,
        deal_size_min: deal_size_min || null,
        deal_size_max: deal_size_max || null,
        years_experience: years_experience || null,
        deals_closed: deals_closed || null,
        is_verified: is_verified || false,
        is_featured: is_featured || false,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (providerError) {
      console.error('Error creating provider:', providerError)
      if (providerError.code === '23505') {
        return NextResponse.json(
          { message: 'A provider with this slug already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: 'Failed to create provider' },
        { status: 500 }
      )
    }

    // Add categories
    if (category_ids && category_ids.length > 0) {
      const categoryInserts = category_ids.map((categoryId: string) => ({
        provider_id: provider.id,
        category_id: categoryId,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_categories') as any).insert(categoryInserts)
    }

    // Add services
    if (service_ids && service_ids.length > 0) {
      const serviceInserts = service_ids.map((serviceId: string) => ({
        provider_id: provider.id,
        service_id: serviceId,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_services') as any).insert(serviceInserts)
    }

    // Add industries
    if (industry_ids && industry_ids.length > 0) {
      const industryInserts = industry_ids.map((industryId: string) => ({
        provider_id: provider.id,
        industry_id: industryId,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_industries') as any).insert(industryInserts)
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error('Provider API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
