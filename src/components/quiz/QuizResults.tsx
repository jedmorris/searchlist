'use client'

import Link from 'next/link'
import { CheckCircle, MapPin, Wifi, BadgeCheck, Star, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarRatingDisplay } from '@/components/reviews/StarRating'
import { formatDealSizeRange } from '@/lib/constants'
import type { QuizMatchedProvider, Category } from '@/types/database'
import type { QuizData } from './QuizWizard'

interface QuizResultsProps {
  providers: (QuizMatchedProvider & { categories: Category[] })[]
  leadId: string | null
  quizData: QuizData
}

export function QuizResults({ providers, quizData }: QuizResultsProps) {
  const hasMatches = providers.length > 0

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                Thanks, {quizData.name.split(' ')[0]}!
              </h2>
              <p className="text-green-700 dark:text-green-300 mt-1">
                {hasMatches
                  ? `We found ${providers.length} provider${providers.length > 1 ? 's' : ''} that match${providers.length === 1 ? 'es' : ''} your criteria.`
                  : 'We couldn\'t find any exact matches, but here are some providers who might be able to help.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matched Providers */}
      {hasMatches ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Matched Providers</h3>
          <div className="space-y-4">
            {providers.map((provider, index) => (
              <MatchedProviderCard
                key={provider.id}
                provider={provider}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Exact Matches Found</CardTitle>
            <CardDescription>
              Try adjusting your criteria or browse all providers in our directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/providers">
                  Browse All Providers
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium">Want to explore more options?</p>
              <p className="text-sm text-muted-foreground">
                Browse our full directory of trusted service providers.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button asChild>
                <Link href="/providers">
                  Browse Directory
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MatchedProviderCardProps {
  provider: QuizMatchedProvider & { categories: Category[] }
  rank: number
}

function MatchedProviderCard({ provider, rank }: MatchedProviderCardProps) {
  const initials = provider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const matchPercentage = Math.min(Math.round((provider.match_score / 100) * 100), 100)

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Rank & Avatar */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex flex-col items-center">
              <span className="text-sm font-medium text-muted-foreground mb-1">#{rank}</span>
              <Avatar className="h-14 w-14">
                <AvatarImage src={provider.headshot_url || undefined} alt={provider.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Provider Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-lg">{provider.name}</h4>
                {provider.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
                {provider.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 fill-yellow-500" />
                )}
              </div>
              {provider.company_name && (
                <p className="text-sm text-muted-foreground">{provider.company_name}</p>
              )}
              {provider.tagline && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {provider.tagline}
                </p>
              )}

              {/* Rating */}
              {provider.rating_average !== null && (
                <div className="mt-2">
                  <StarRatingDisplay
                    rating={provider.rating_average}
                    count={provider.rating_count}
                    size="sm"
                  />
                </div>
              )}

              {/* Location & Details */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                {(provider.deal_size_min !== null || provider.deal_size_max !== null) && (
                  <span>
                    Deal Size: {formatDealSizeRange(provider.deal_size_min, provider.deal_size_max)}
                  </span>
                )}
              </div>

              {/* Categories */}
              {provider.categories && provider.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
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
            </div>
          </div>

          {/* Match Score & Action */}
          <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start sm:items-end gap-4 sm:ml-auto">
            <div className="text-center sm:text-right">
              <div className="text-2xl font-bold text-primary">{matchPercentage}%</div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
            <Button asChild size="sm">
              <Link href={`/provider/${provider.slug}`}>
                View Profile
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
