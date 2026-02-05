import Link from 'next/link'
import { Star, MessageSquare, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface TopProviderData {
  id: string
  name: string
  slug: string
  company_name: string | null
  tagline: string | null
  headshot_url: string | null
  rating_average: number | null
  rating_count: number
  is_verified: boolean
  categories: { id: string; name: string; slug: string }[]
}

interface TopProvidersSectionProps {
  topRated: TopProviderData[]
  mostReviewed: TopProviderData[]
}

export function TopProvidersSection({ topRated, mostReviewed }: TopProvidersSectionProps) {
  // Don't render if we don't have any providers with reviews
  if (topRated.length === 0 && mostReviewed.length === 0) {
    return null
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Top-Rated Providers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our highest-rated and most-reviewed service providers,
            trusted by entrepreneurs in the ETA community.
          </p>
        </div>

        <Tabs defaultValue="top-rated" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="top-rated" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="most-reviewed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Reviewed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-rated">
            {topRated.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRated.map((provider, index) => (
                  <TopProviderCard
                    key={provider.id}
                    provider={provider}
                    rank={index + 1}
                    badgeType="rating"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No rated providers yet" />
            )}
          </TabsContent>

          <TabsContent value="most-reviewed">
            {mostReviewed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mostReviewed.map((provider, index) => (
                  <TopProviderCard
                    key={provider.id}
                    provider={provider}
                    rank={index + 1}
                    badgeType="reviews"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No reviewed providers yet" />
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/search">
              View All Providers
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

interface TopProviderCardProps {
  provider: TopProviderData
  rank: number
  badgeType: 'rating' | 'reviews'
}

function TopProviderCard({ provider, rank, badgeType }: TopProviderCardProps) {
  const initials = provider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const rankColors: Record<number, string> = {
    1: 'bg-yellow-500 text-yellow-950',
    2: 'bg-gray-400 text-gray-950',
    3: 'bg-amber-600 text-amber-950',
  }

  return (
    <Link href={`/provider/${provider.slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
        <CardContent className="p-6">
          {/* Rank Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rankColors[rank] || 'bg-muted text-muted-foreground'}`}>
              {rank}
            </div>
            {badgeType === 'rating' && provider.rating_average !== null && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {provider.rating_average.toFixed(1)}
              </Badge>
            )}
            {badgeType === 'reviews' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {provider.rating_count} review{provider.rating_count !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Provider Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={provider.headshot_url || undefined} alt={provider.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {provider.name}
              </h3>
              {provider.company_name && (
                <p className="text-sm text-muted-foreground truncate">
                  {provider.company_name}
                </p>
              )}
            </div>
          </div>

          {/* Tagline */}
          {provider.tagline && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              {provider.tagline}
            </p>
          )}

          {/* Rating & Reviews */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            {provider.rating_average !== null && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= Math.round(provider.rating_average!)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  ({provider.rating_count})
                </span>
              </div>
            )}
          </div>

          {/* Categories */}
          {provider.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {provider.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {provider.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
