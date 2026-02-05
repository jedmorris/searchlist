import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { CurrentPlan } from '@/components/billing/CurrentPlan'
import { FEATURE_BOOSTS } from '@/lib/stripe/products'
import type { ProviderSubscription, FeaturePurchase } from '@/types/database'

async function getSubscriptionData(providerId: string) {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('provider_subscriptions')
    .select('*')
    .eq('provider_id', providerId)
    .single()

  const { data: activePurchases } = await supabase
    .from('feature_purchases')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())

  return {
    subscription: subscription as ProviderSubscription | null,
    activePurchases: (activePurchases || []) as FeaturePurchase[],
  }
}

export default async function SubscriptionPage() {
  const profile = await getUserProfile()

  if (!profile?.provider_id) {
    redirect('/portal')
  }

  const { subscription, activePurchases } = await getSubscriptionData(profile.provider_id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/portal" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Subscription</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your plan and billing
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/subscription/upgrade">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <CurrentPlan subscription={subscription} />

        {/* Active Boosts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Active Boosts
            </CardTitle>
            <CardDescription>
              One-time feature purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activePurchases.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active boosts. Purchase a boost to increase your visibility.
              </p>
            ) : (
              <ul className="space-y-3">
                {activePurchases.map((purchase) => {
                  const boost = FEATURE_BOOSTS.find(b => b.type === purchase.feature_type)
                  return (
                    <li key={purchase.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{boost?.name || purchase.feature_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {new Date(purchase.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Boosts */}
      <Card>
        <CardHeader>
          <CardTitle>Available Boosts</CardTitle>
          <CardDescription>
            One-time purchases to increase your visibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_BOOSTS.map((boost) => (
              <div key={boost.type} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{boost.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {boost.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${boost.price}</span>
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
