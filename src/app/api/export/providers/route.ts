import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert to CSV
  const headers = [
    'ID',
    'Name',
    'Company Name',
    'Email',
    'Phone',
    'Website',
    'LinkedIn',
    'City',
    'State',
    'Is Remote',
    'Tagline',
    'Bio',
    'Deal Size Min ($K)',
    'Deal Size Max ($K)',
    'Years Experience',
    'Deals Closed',
    'Is Active',
    'Is Verified',
    'Is Featured',
    'Created At',
  ]

  const rows = data.map((provider: {
    id: string
    name: string
    company_name: string | null
    email: string
    phone: string | null
    website: string | null
    linkedin: string | null
    city: string | null
    state: string | null
    is_remote: boolean
    tagline: string | null
    bio: string | null
    deal_size_min: number | null
    deal_size_max: number | null
    years_experience: number | null
    deals_closed: number | null
    is_active: boolean
    is_verified: boolean
    is_featured: boolean
    created_at: string
  }) => [
    provider.id,
    provider.name,
    provider.company_name || '',
    provider.email,
    provider.phone || '',
    provider.website || '',
    provider.linkedin || '',
    provider.city || '',
    provider.state || '',
    provider.is_remote ? 'Yes' : 'No',
    (provider.tagline || '').replace(/"/g, '""').replace(/\n/g, ' '),
    (provider.bio || '').replace(/"/g, '""').replace(/\n/g, ' '),
    provider.deal_size_min || '',
    provider.deal_size_max || '',
    provider.years_experience || '',
    provider.deals_closed || '',
    provider.is_active ? 'Yes' : 'No',
    provider.is_verified ? 'Yes' : 'No',
    provider.is_featured ? 'Yes' : 'No',
    new Date(provider.created_at).toISOString(),
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="providers-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
