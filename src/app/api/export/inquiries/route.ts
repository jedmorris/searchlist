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
    .from('inquiries')
    .select('*, providers(name, company_name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert to CSV
  const headers = [
    'ID',
    'Date',
    'Status',
    'Provider Name',
    'Provider Company',
    'Sender Name',
    'Sender Email',
    'Sender Phone',
    'Company Name',
    'Deal Context',
    'Message',
    'Is Read',
  ]

  const rows = data.map((inquiry: {
    id: string
    created_at: string
    status: string
    providers: { name: string; company_name: string | null } | null
    sender_name: string
    sender_email: string
    sender_phone: string | null
    company_name: string | null
    deal_context: string | null
    message: string
    is_read: boolean
  }) => [
    inquiry.id,
    new Date(inquiry.created_at).toISOString(),
    inquiry.status || 'new',
    inquiry.providers?.name || '',
    inquiry.providers?.company_name || '',
    inquiry.sender_name,
    inquiry.sender_email,
    inquiry.sender_phone || '',
    inquiry.company_name || '',
    inquiry.deal_context || '',
    inquiry.message.replace(/"/g, '""').replace(/\n/g, ' '), // Escape quotes and newlines
    inquiry.is_read ? 'Yes' : 'No',
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inquiries-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
