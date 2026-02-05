import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/roles'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createAdminClient()

    const { data: leads, error, count } = await supabase
      .from('quiz_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching quiz leads:', error)
      return NextResponse.json({ error: 'Failed to fetch quiz leads' }, { status: 500 })
    }

    return NextResponse.json({
      leads,
      total: count,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error('Quiz leads API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
