'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Heart, Trash2 } from 'lucide-react'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { Button } from '@/components/ui/button'
import { useSavedProviders } from '@/contexts/SavedProvidersContext'
import type { Provider, Category } from '@/types/database'
import type { FeaturedReview } from '@/components/providers/ProviderCard'

type ProviderWithCategories = Provider & {
  categories?: Category[]
  featured_review?: FeaturedReview | null
}

export default function SavedProvidersPage() {
  const { savedProviderIds, clearAll } = useSavedProviders()
  const [providers, setProviders] = useState<ProviderWithCategories[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSavedProviders() {
      if (savedProviderIds.size === 0) {
        setProviders([])
        setLoading(false)
        return
      }

      try {
        const ids = Array.from(savedProviderIds)
        const response = await fetch(`/api/providers/batch?ids=${ids.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          setProviders(data.providers || [])
        }
      } catch (error) {
        console.error('Failed to fetch saved providers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedProviders()
  }, [savedProviderIds])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Saved Providers</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Providers</h1>
          <p className="text-muted-foreground">
            {savedProviderIds.size} {savedProviderIds.size === 1 ? 'provider' : 'providers'} saved
          </p>
        </div>
        {savedProviderIds.size > 0 && (
          <Button variant="outline" onClick={clearAll} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : savedProviderIds.size === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved providers yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            When you find providers you&apos;re interested in, click the heart icon to save them
            here for easy access later.
          </p>
          <Link href="/">
            <Button>Browse Providers</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  )
}
