import Link from 'next/link'
import { MapPin, Wifi, BadgeCheck, Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarRatingDisplay } from '@/components/reviews/StarRating'
import { formatDealSizeRange } from '@/lib/constants'
import type { Provider, Category } from '@/types/database'

export interface FeaturedReview {
  content: string
  author_name: string
  rating: number
}

interface ProviderCardProps {
  provider: Provider & {
    categories?: Category[]
    featured_review?: FeaturedReview | null
  }
  showReviewQuote?: boolean
}

export function ProviderCard({ provider, showReviewQuote = true }: ProviderCardProps) {
  const initials = provider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const featuredReview = provider.featured_review
  const hasReview = showReviewQuote && featuredReview && featuredReview.content

  // Truncate review content
  const maxQuoteLength = 100
  const truncatedQuote = hasReview && featuredReview.content.length > maxQuoteLength
    ? featuredReview.content.substring(0, maxQuoteLength).trim() + '...'
    : featuredReview?.content

  return (
    <Link href={`/provider/${provider.slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={provider.headshot_url || undefined} alt={provider.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{provider.name}</h3>
                {provider.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
                {provider.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 fill-yellow-500" />
                )}
              </div>
              {provider.company_name && (
                <p className="text-sm text-muted-foreground truncate">
                  {provider.company_name}
                </p>
              )}
            </div>
          </div>

          {provider.tagline && !hasReview && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              {provider.tagline}
            </p>
          )}

          {/* Featured Review Quote */}
          {hasReview && (
            <div className="mt-4 relative">
              <Quote className="absolute -top-1 -left-1 h-4 w-4 text-primary/30" />
              <p className="text-sm text-muted-foreground italic pl-4 line-clamp-2">
                &ldquo;{truncatedQuote}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1 pl-4">
                — {featuredReview.author_name}
              </p>
            </div>
          )}

          {(provider.rating_average !== null && provider.rating_average !== undefined) && (
            <div className="mt-3">
              <StarRatingDisplay
                rating={provider.rating_average}
                count={provider.rating_count}
                size="sm"
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {(provider.city || provider.state) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[provider.city, provider.state].filter(Boolean).join(', ')}
              </span>
            )}
            {provider.is_remote && (
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Remote
              </span>
            )}
          </div>

          {(provider.deal_size_min !== null || provider.deal_size_max !== null) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Deal Size: {formatDealSizeRange(provider.deal_size_min, provider.deal_size_max)}
            </p>
          )}

          {provider.categories && provider.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {provider.categories.slice(0, 3).map((category) => (
                <Badge key={category.id} variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {provider.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.categories.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
