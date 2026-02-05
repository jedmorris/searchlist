import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_services')
    .select('service_id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const counts: Record<string, number> = {}
  data?.forEach((item: { service_id: string }) => {
    counts[item.service_id] = (counts[item.service_id] || 0) + 1
  })

  return NextResponse.json(counts)
}
