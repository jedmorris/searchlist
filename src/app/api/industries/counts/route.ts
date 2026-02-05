import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET provider counts per industry
export async function GET() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('provider_industries') as any)
    .select('industry_id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count occurrences of each industry_id
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.industry_id] = (counts[row.industry_id] || 0) + 1
  }

  return NextResponse.json(counts)
}
