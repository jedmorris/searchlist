import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { requireProviderWithProviderId } from '@/lib/auth/roles'

export async function POST() {
  try {
    const { providerId } = await requireProviderWithProviderId()
    const supabase = await createClient()

    // Get subscription with customer ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase.from('provider_subscriptions') as any)
      .select('stripe_customer_id')
      .eq('provider_id', providerId)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/portal/subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
