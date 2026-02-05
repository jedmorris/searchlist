import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { requireProviderWithProviderId } from '@/lib/auth/roles'
import { getPlanByTier, getBoostByType } from '@/lib/stripe/products'
import type { SubscriptionTier } from '@/types/database'

export async function POST(request: Request) {
  try {
    const { providerId } = await requireProviderWithProviderId()
    const supabase = await createClient()
    const body = await request.json()

    const { type, tier, boostType, billingPeriod = 'monthly' } = body

    // Get provider info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: provider } = await (supabase.from('providers') as any)
      .select('id, name, email')
      .eq('id', providerId)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check for existing subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingSub } = await (supabase.from('provider_subscriptions') as any)
      .select('stripe_customer_id')
      .eq('provider_id', providerId)
      .single()

    let customerId = existingSub?.stripe_customer_id

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: provider.email,
        name: provider.name,
        metadata: {
          provider_id: providerId,
        },
      })
      customerId = customer.id
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (type === 'subscription') {
      // Subscription checkout
      const plan = getPlanByTier(tier as SubscriptionTier)
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      const priceId = billingPeriod === 'yearly' ? plan.priceIdYearly : plan.priceIdMonthly
      if (!priceId) {
        return NextResponse.json({ error: 'Plan not available' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/portal/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/portal/subscription/upgrade`,
        metadata: {
          provider_id: providerId,
          tier,
          billing_period: billingPeriod,
        },
        subscription_data: {
          metadata: {
            provider_id: providerId,
            tier,
          },
        },
      })

      return NextResponse.json({ url: session.url })
    } else if (type === 'boost') {
      // One-time boost purchase
      const boost = getBoostByType(boostType)
      if (!boost || !boost.priceId) {
        return NextResponse.json({ error: 'Invalid boost type' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [
          {
            price: boost.priceId,
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/portal/subscription/success?session_id={CHECKOUT_SESSION_ID}&type=boost`,
        cancel_url: `${siteUrl}/portal/subscription`,
        metadata: {
          provider_id: providerId,
          boost_type: boostType,
          price_id: boost.priceId,
        },
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
