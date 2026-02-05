import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { getPlanByPriceId, getBoostByPriceId } from '@/lib/stripe/products'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'
import type { SubscriptionTier, SubscriptionStatus } from '@/types/database'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(supabase, session)
        } else if (session.mode === 'payment') {
          await handleOneTimePayment(supabase, session)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePayment(supabase, invoice, 'succeeded')
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePayment(supabase, invoice, 'failed')
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const providerId = session.metadata?.provider_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!providerId) {
    console.error('No provider_id in checkout session metadata')
    return
  }

  // Get subscription details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanByPriceId(priceId)

  // Upsert subscription record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('provider_subscriptions') as any)
    .upsert({
      provider_id: providerId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      tier: (plan?.tier || 'basic') as SubscriptionTier,
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: 'provider_id'
    })
}

async function handleSubscriptionUpdate(
  supabase: ReturnType<typeof createAdminClient>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any
) {
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanByPriceId(priceId)

  // Find provider by stripe subscription id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingSub } = await (supabase.from('provider_subscriptions') as any)
    .select('provider_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!existingSub) {
    console.error('No subscription found for:', subscription.id)
    return
  }

  // Update subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('provider_subscriptions') as any)
    .update({
      tier: (plan?.tier || 'free') as SubscriptionTier,
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleOneTimePayment(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const providerId = session.metadata?.provider_id
  const boostType = session.metadata?.boost_type

  if (!providerId || !boostType) {
    console.error('Missing metadata in one-time payment session')
    return
  }

  const boost = getBoostByPriceId(session.metadata?.price_id || '')
  if (!boost) return

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + boost.durationDays)

  // Create feature purchase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('feature_purchases') as any).insert({
    provider_id: providerId,
    feature_type: boostType,
    stripe_payment_intent_id: session.payment_intent as string,
    expires_at: expiresAt.toISOString(),
    is_active: true,
  })

  // Record payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('payment_history') as any).insert({
    provider_id: providerId,
    stripe_payment_intent_id: session.payment_intent as string,
    amount_cents: session.amount_total || 0,
    currency: session.currency || 'usd',
    description: `${boost.name} - ${boost.durationDays} days`,
    status: 'succeeded',
  })
}

async function handleInvoicePayment(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice,
  status: 'succeeded' | 'failed'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string
  if (!subscriptionId) return

  // Find provider by subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (supabase.from('provider_subscriptions') as any)
    .select('provider_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) return

  // Record payment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('payment_history') as any).insert({
    provider_id: sub.provider_id,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_paid || invoice.amount_due || 0,
    currency: invoice.currency || 'usd',
    description: invoice.lines.data[0]?.description || 'Subscription payment',
    status,
  })

  // Update subscription status if payment failed
  if (status === 'failed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('provider_subscriptions') as any)
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId)
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    trialing: 'trialing',
    unpaid: 'past_due',
    paused: 'canceled',
  }
  return statusMap[status] || 'active'
}
