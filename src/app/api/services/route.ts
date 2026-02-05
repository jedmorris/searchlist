import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET all services (optionally filtered by category)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category_id')

  const supabase = await createClient()

  let query = supabase
    .from('services')
    .select('*, categories(name, slug)')
    .order('name')

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST - create new service
export async function POST(request: Request) {
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
      .insert({
        name,
        slug,
        category_id,
      })
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
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
