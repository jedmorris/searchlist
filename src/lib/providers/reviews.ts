import { createClient } from '@/lib/supabase/server'
import type { FeaturedReview } from '@/components/providers/ProviderCard'

/**
 * Fetches a featured review for each provider in the list.
 * Returns a map of provider_id -> FeaturedReview
 * Prioritizes: featured reviews > highest rated > most recent
 */
export async function getFeaturedReviewsForProviders(
  providerIds: string[]
): Promise<Record<string, FeaturedReview>> {
  if (providerIds.length === 0) return {}

  const supabase = await createClient()

  // Fetch the best review for each provider
  // We'll get all approved reviews and then pick the best one for each provider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews, error } = await (supabase.from('reviews') as any)
    .select('provider_id, content, author_name, rating, is_featured')
    .in('provider_id', providerIds)
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })

  if (error || !reviews) {
    console.error('Error fetching featured reviews:', error)
    return {}
  }

  // Group reviews by provider and pick the best one for each
  const reviewMap: Record<string, FeaturedReview> = {}

  for (const review of reviews as {
    provider_id: string
    content: string
    author_name: string
    rating: number
    is_featured: boolean
  }[]) {
    // Only keep the first (best) review for each provider
    if (!reviewMap[review.provider_id]) {
      reviewMap[review.provider_id] = {
        content: review.content,
        author_name: review.author_name,
        rating: review.rating,
      }
    }
  }

  return reviewMap
}

/**
 * Adds featured reviews to a list of providers
 */
export async function addFeaturedReviewsToProviders<
  T extends { id: string }
>(providers: T[]): Promise<(T & { featured_review: FeaturedReview | null })[]> {
  if (providers.length === 0) return []

  const providerIds = providers.map((p) => p.id)
  const reviewMap = await getFeaturedReviewsForProviders(providerIds)

  return providers.map((provider) => ({
    ...provider,
    featured_review: reviewMap[provider.id] || null,
  }))
}
