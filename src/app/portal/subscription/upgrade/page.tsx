import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { PricingTable } from '@/components/billing/PricingTable'
import type { ProviderSubscription } from '@/types/database'

async function getCurrentTier(providerId: string): Promise<string> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('provider_subscriptions')
    .select('tier')
    .eq('provider_id', providerId)
    .single()

  return (subscription as ProviderSubscription | null)?.tier || 'free'
}

export default async function UpgradePage() {
  const profile = await getUserProfile()

  if (!profile?.provider_id) {
    redirect('/portal')
  }

  const currentTier = await getCurrentTier(profile.provider_id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/portal" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/portal/subscription" className="hover:text-primary">
          Subscription
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Upgrade</span>
      </nav>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Upgrade your subscription to get more visibility and features for your profile.
        </p>
      </div>

      <PricingTable currentTier={currentTier} />
    </div>
  )
}
