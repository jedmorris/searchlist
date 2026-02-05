import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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

    // Send email notification if Resend is configured
    if (resend && provider.email) {
      const dealContextMap: Record<string, string> = {
        buying: 'Buying a business',
        selling: 'Selling a business',
        both: 'Both buying and selling',
        general: 'General inquiry',
      }
      const dealContextLabel = deal_context
        ? dealContextMap[deal_context as string] || deal_context
        : 'Not specified'

      try {
        await resend.emails.send({
          from: 'Search List <noreply@searchlist.com>',
          to: provider.email,
          subject: `New Inquiry from ${sender_name} via Search List`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New Inquiry from Search List</h2>
              <p>Hi ${provider.name.split(' ')[0]},</p>
              <p>You have received a new inquiry through Search List:</p>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${sender_name}</p>
                <p><strong>Email:</strong> ${sender_email}</p>
                ${sender_phone ? `<p><strong>Phone:</strong> ${sender_phone}</p>` : ''}
                ${company_name ? `<p><strong>Company:</strong> ${company_name}</p>` : ''}
                <p><strong>Context:</strong> ${dealContextLabel}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>

              <p>Reply directly to this email or contact ${sender_name} at ${sender_email}.</p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0 15px;" />
              <p style="color: #666; font-size: 12px;">
                This message was sent via Search List.
                You're receiving this because you're listed as a provider.
              </p>
            </div>
          `,
          replyTo: sender_email,
        })
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Error sending email notification:', emailError)
      }
    }

    // Also notify admin if configured
    if (resend && process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: 'Search List <noreply@searchlist.com>',
          to: process.env.ADMIN_EMAIL,
          subject: `[Search List] New inquiry for ${provider.name}`,
          html: `
            <div style="font-family: sans-serif;">
              <p>New inquiry submitted:</p>
              <ul>
                <li><strong>Provider:</strong> ${provider.name} (${provider.company_name || 'N/A'})</li>
                <li><strong>From:</strong> ${sender_name} (${sender_email})</li>
                <li><strong>Context:</strong> ${deal_context || 'Not specified'}</li>
              </ul>
              <p>Message preview: ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Error sending admin notification:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Inquiry API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
