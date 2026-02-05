import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireProviderWithProviderId } from '@/lib/auth/roles'

export async function GET() {
  try {
    const { providerId } = await requireProviderWithProviderId()
    const supabase = await createClient()

    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get categories and services
    const [categoriesResult, servicesResult] = await Promise.all([
      supabase
        .from('provider_categories')
        .select('category_id')
        .eq('provider_id', providerId),
      supabase
        .from('provider_services')
        .select('service_id')
        .eq('provider_id', providerId),
    ])

    return NextResponse.json({
      provider,
      category_ids: (categoriesResult.data || []).map((c: { category_id: string }) => c.category_id),
      service_ids: (servicesResult.data || []).map((s: { service_id: string }) => s.service_id),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { providerId } = await requireProviderWithProviderId()
    const supabase = await createClient()
    const body = await request.json()

    // Extract category and service IDs
    const { category_ids, service_ids, ...providerData } = body

    // Fields that providers can update (exclude admin-only fields)
    const allowedFields = [
      'name',
      'company_name',
      'phone',
      'website',
      'linkedin',
      'headshot_url',
      'logo_url',
      'tagline',
      'bio',
      'city',
      'state',
      'is_remote',
      'deal_size_min',
      'deal_size_max',
      'years_experience',
      'deals_closed',
    ]

    // Filter to only allowed fields
    const filteredData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in providerData) {
        filteredData[field] = providerData[field]
      }
    }

    // Update provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: providerError } = await (supabase.from('providers') as any)
      .update(filteredData)
      .eq('id', providerId)

    if (providerError) {
      return NextResponse.json({ error: providerError.message }, { status: 500 })
    }

    // Update categories if provided
    if (Array.isArray(category_ids)) {
      // Delete existing
      await supabase
        .from('provider_categories')
        .delete()
        .eq('provider_id', providerId)

      // Insert new
      if (category_ids.length > 0) {
        const categoryInserts = category_ids.map((categoryId: string) => ({
          provider_id: providerId,
          category_id: categoryId,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('provider_categories') as any).insert(categoryInserts)
      }
    }

    // Update services if provided
    if (Array.isArray(service_ids)) {
      // Delete existing
      await supabase
        .from('provider_services')
        .delete()
        .eq('provider_id', providerId)

      // Insert new
      if (service_ids.length > 0) {
        const serviceInserts = service_ids.map((serviceId: string) => ({
          provider_id: providerId,
          service_id: serviceId,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('provider_services') as any).insert(serviceInserts)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
