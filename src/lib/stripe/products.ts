import type { SubscriptionTier } from '@/types/database'

export interface PricingPlan {
  tier: SubscriptionTier
  name: string
  description: string
  monthlyPrice: number // in dollars
  yearlyPrice: number // in dollars
  priceIdMonthly: string | null
  priceIdYearly: string | null
  features: string[]
  highlighted?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Basic listing in the directory',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceIdMonthly: null,
    priceIdYearly: null,
    features: [
      'Basic profile listing',
      'Contact form',
      'Up to 3 categories',
    ],
  },
  {
    tier: 'basic',
    name: 'Basic',
    description: 'Enhanced visibility and features',
    monthlyPrice: 29,
    yearlyPrice: 290,
    priceIdMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
    features: [
      'Everything in Free',
      'Priority in search results',
      'Unlimited categories',
      'Analytics dashboard',
    ],
  },
  {
    tier: 'featured',
    name: 'Featured',
    description: 'Maximum exposure for your profile',
    monthlyPrice: 79,
    yearlyPrice: 790,
    priceIdMonthly: process.env.STRIPE_PRICE_FEATURED_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRICE_FEATURED_YEARLY || '',
    features: [
      'Everything in Basic',
      'Featured badge on profile',
      'Homepage placement',
      'Category page highlight',
    ],
    highlighted: true,
  },
  {
    tier: 'premium',
    name: 'Premium',
    description: 'Full suite of premium features',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    priceIdMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
    features: [
      'Everything in Featured',
      'Dedicated account manager',
      'Custom profile design',
      'Priority support',
      'Lead notifications',
    ],
  },
]

export interface FeatureBoost {
  type: 'spotlight' | 'homepage_feature' | 'category_boost'
  name: string
  description: string
  price: number // in dollars
  durationDays: number
  priceId: string
}

export const FEATURE_BOOSTS: FeatureBoost[] = [
  {
    type: 'spotlight',
    name: 'Spotlight',
    description: 'Get featured at the top of search results for 7 days',
    price: 49,
    durationDays: 7,
    priceId: process.env.STRIPE_PRICE_SPOTLIGHT || '',
  },
  {
    type: 'homepage_feature',
    name: 'Homepage Feature',
    description: 'Appear on the homepage for 30 days',
    price: 99,
    durationDays: 30,
    priceId: process.env.STRIPE_PRICE_HOMEPAGE || '',
  },
  {
    type: 'category_boost',
    name: 'Category Boost',
    description: 'Top placement in your category for 14 days',
    price: 69,
    durationDays: 14,
    priceId: process.env.STRIPE_PRICE_CATEGORY_BOOST || '',
  },
]

export function getPlanByTier(tier: SubscriptionTier): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.tier === tier)
}

export function getPlanByPriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(
    (plan) => plan.priceIdMonthly === priceId || plan.priceIdYearly === priceId
  )
}

export function getBoostByType(type: string): FeatureBoost | undefined {
  return FEATURE_BOOSTS.find((boost) => boost.type === type)
}

export function getBoostByPriceId(priceId: string): FeatureBoost | undefined {
  return FEATURE_BOOSTS.find((boost) => boost.priceId === priceId)
}
