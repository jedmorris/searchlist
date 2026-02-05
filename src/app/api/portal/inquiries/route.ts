import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireProviderWithProviderId } from '@/lib/auth/roles'

export async function GET(request: Request) {
  try {
    const { providerId } = await requireProviderWithProviderId()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('inquiries')
      .select('*', { count: 'exact' })
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact' })
      .eq('provider_id', providerId)
      .eq('is_read', false)

    return NextResponse.json({
      inquiries: data,
      total: count || 0,
      unread: unreadCount || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
