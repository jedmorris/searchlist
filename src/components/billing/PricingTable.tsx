'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { PricingCard } from './PricingCard'
import { PRICING_PLANS } from '@/lib/stripe/products'

interface PricingTableProps {
  currentTier?: string
}

export function PricingTable({ currentTier }: PricingTableProps) {
  const { toast } = useToast()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)

  async function handleSelectPlan(tier: string) {
    if (tier === 'free') return

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          tier,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
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
    <div className="space-y-8">
      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
              Save 17%
            </span>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.tier}
            plan={plan}
            billingPeriod={billingPeriod}
            currentTier={currentTier}
            onSelect={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
