import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      slug,
      company_name,
      email,
      phone,
      website,
      linkedin,
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
    } = body

    if (!name || !slug || !email) {
      return NextResponse.json(
        { message: 'Name, slug, and email are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update provider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: provider, error: providerError } = await (supabase.from('providers') as any)
      .update({
        name,
        slug,
        company_name: company_name || null,
        email,
        phone: phone || null,
        website: website || null,
        linkedin: linkedin || null,
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
      .eq('id', id)
      .select()
      .single()

    if (providerError) {
      console.error('Error updating provider:', providerError)
      if (providerError.code === '23505') {
        return NextResponse.json(
          { message: 'A provider with this slug already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: 'Failed to update provider' },
        { status: 500 }
      )
    }

    // Update categories - remove old and add new
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('provider_categories') as any)
      .delete()
      .eq('provider_id', id)

    if (category_ids && category_ids.length > 0) {
      const categoryInserts = category_ids.map((categoryId: string) => ({
        provider_id: id,
        category_id: categoryId,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_categories') as any).insert(categoryInserts)
    }

    // Update services - remove old and add new
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('provider_services') as any)
      .delete()
      .eq('provider_id', id)

    if (service_ids && service_ids.length > 0) {
      const serviceInserts = service_ids.map((serviceId: string) => ({
        provider_id: id,
        service_id: serviceId,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_services') as any).insert(serviceInserts)
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('providers') as any).delete().eq('id', id)

    if (error) {
      console.error('Error deleting provider:', error)
      return NextResponse.json(
        { message: 'Failed to delete provider' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Provider API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
