import { ProviderCard, type FeaturedReview } from './ProviderCard'
import type { Provider, Category } from '@/types/database'

export type ProviderWithReview = Provider & {
  categories?: Category[]
  featured_review?: FeaturedReview | null
}

interface ProviderGridProps {
  providers: ProviderWithReview[]
  showReviewQuotes?: boolean
}

export function ProviderGrid({ providers, showReviewQuotes = true }: ProviderGridProps) {
  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No providers found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          showReviewQuote={showReviewQuotes}
        />
      ))}
    </div>
  )
}
