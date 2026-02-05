import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  const supabase = await createClient()

  if (type === 'providers') {
    const { data, error } = await supabase
      .from('provider_categories')
      .select('category_id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const counts: Record<string, number> = {}
    data?.forEach((item: { category_id: string }) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1
    })

    return NextResponse.json(counts)
  }

  if (type === 'services') {
    const { data, error } = await supabase
      .from('services')
      .select('category_id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const counts: Record<string, number> = {}
    data?.forEach((item: { category_id: string }) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1
    })

    return NextResponse.json(counts)
  }

  return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
}
