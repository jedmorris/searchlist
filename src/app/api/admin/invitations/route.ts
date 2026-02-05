import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('provider_invitations')
      .select('*, providers(id, name, slug)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invitations: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const profile = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { email, provider_id } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if invitation already exists for this email
    const { data: existing } = await supabase
      .from('provider_invitations')
      .select('id')
      .eq('email', email)
      .is('accepted_at', null)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'An invitation already exists for this email' },
        { status: 400 }
      )
    }

    // Create invitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('provider_invitations') as any)
      .insert({
        email,
        provider_id: provider_id || null,
        invited_by: profile.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Send invitation email via Resend
    // For now, we'll just return the token for manual sharing
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/accept-invitation?token=${data.token}`

    return NextResponse.json({
      invitation: data,
      invite_url: inviteUrl,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}
