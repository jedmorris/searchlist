import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'pending'

    let query = supabase
      .from('reviews')
      .select('*, providers(id, name, slug)')
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('is_approved', false)
    } else if (filter === 'approved') {
      query = query.eq('is_approved', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reviews: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
