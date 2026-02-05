import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single category
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PUT - update category
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
    const { name, slug, description, icon, display_order } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (adminClient.from('categories') as any)
      .update({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        display_order: display_order ?? 0,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
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

    // Check if category has providers
    const { count: providerCount } = await adminClient
      .from('provider_categories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (providerCount && providerCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${providerCount} provider(s). Remove providers first.` },
        { status: 400 }
      )
    }

    // Delete associated services first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient.from('services') as any)
      .delete()
      .eq('category_id', id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (adminClient.from('categories') as any)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
