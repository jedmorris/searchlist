'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getPlanByTier } from '@/lib/stripe/products'
import type { ProviderSubscription } from '@/types/database'

interface CurrentPlanProps {
  subscription: ProviderSubscription | null
}

export function CurrentPlan({ subscription }: CurrentPlanProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const plan = subscription ? getPlanByTier(subscription.tier) : getPlanByTier('free')
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const willCancel = subscription?.cancel_at_period_end

  async function handleManageSubscription() {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your subscription details
            </CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : isPastDue ? 'destructive' : 'secondary'}>
            {plan?.name || 'Free'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPastDue && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Payment failed. Please update your payment method.</p>
          </div>
        )}

        {willCancel && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-700 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Your subscription will be canceled at the end of the billing period.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-semibold">{plan?.name || 'Free'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">{subscription?.status || 'Active'}</p>
          </div>
          {subscription?.current_period_end && (
            <div>
              <p className="text-sm text-muted-foreground">
                {willCancel ? 'Cancels On' : 'Renews On'}
              </p>
              <p className="font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {plan && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Features</p>
            <ul className="text-sm space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index}>- {feature}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {subscription?.stripe_subscription_id && (
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            Manage Subscription
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
