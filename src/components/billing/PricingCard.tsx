'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PricingPlan } from '@/lib/stripe/products'

interface PricingCardProps {
  plan: PricingPlan
  billingPeriod: 'monthly' | 'yearly'
  currentTier?: string
  onSelect: (tier: string) => void
  loading?: boolean
}

export function PricingCard({
  plan,
  billingPeriod,
  currentTier,
  onSelect,
  loading,
}: PricingCardProps) {
  const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  const monthlyEquivalent = billingPeriod === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
  const isCurrent = currentTier === plan.tier
  const isFree = plan.tier === 'free'

  return (
    <Card className={cn(
      'relative flex flex-col',
      plan.highlighted && 'border-primary shadow-lg scale-105',
      isCurrent && 'border-green-500'
    )}>
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      {isCurrent && (
        <Badge variant="outline" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 border-green-500">
          Current Plan
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">${monthlyEquivalent}</span>
          <span className="text-muted-foreground">/month</span>
          {billingPeriod === 'yearly' && !isFree && (
            <p className="text-sm text-muted-foreground mt-1">
              ${price} billed yearly (save 17%)
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={plan.highlighted ? 'default' : 'outline'}
          disabled={isCurrent || loading || isFree}
          onClick={() => onSelect(plan.tier)}
        >
          {isCurrent ? 'Current Plan' : isFree ? 'Free Plan' : 'Upgrade'}
        </Button>
      </CardFooter>
    </Card>
  )
}
