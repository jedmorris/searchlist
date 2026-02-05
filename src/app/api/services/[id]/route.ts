import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single service
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT - update service
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, category_id } = body

    if (!name || !slug || !category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient.from('services') as any)
      .update({
        name,
        slug,
        category_id,
      })
      .eq('id', id)
      .select('*, categories(name, slug)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A service with this slug already exists in this category' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE service
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()

    // Check if service is used by providers
    const { count: providerCount } = await adminClient
      .from('provider_services')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', id)

    if (providerCount && providerCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete service used by ${providerCount} provider(s). Remove from providers first.` },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient.from('services') as any)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
