import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInquiryNotification, sendInquiryAdminNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      provider_id,
      sender_name,
      sender_email,
      sender_phone,
      company_name,
      deal_context,
      message,
    } = body

    // Validate required fields
    if (!provider_id || !sender_name || !sender_email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the provider's email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: providerData, error: providerError } = await (supabase.from('providers') as any)
      .select('name, email, company_name')
      .eq('id', provider_id)
      .single()

    const provider = providerData as { name: string; email: string; company_name: string | null } | null

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Save the inquiry to the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from('inquiries') as any).insert({
      provider_id,
      sender_name,
      sender_email,
      sender_phone: sender_phone || null,
      company_name: company_name || null,
      deal_context: deal_context || null,
      message,
    })

    if (insertError) {
      console.error('Error saving inquiry:', insertError)
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      )
    }

    // Send email notifications (don't await, fire and forget)
    const emailData = {
      providerName: provider.name,
      providerEmail: provider.email,
      senderName: sender_name,
      senderEmail: sender_email,
      senderPhone: sender_phone,
      companyName: company_name,
      dealContext: deal_context,
      message,
    }

    // Send to provider
    sendInquiryNotification(emailData).catch((err) => {
      console.error('Failed to send inquiry notification:', err)
    })

    // Send to admin
    sendInquiryAdminNotification(emailData).catch((err) => {
      console.error('Failed to send admin notification:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inquiry API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
