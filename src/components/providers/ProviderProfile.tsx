import {
  MapPin,
  Wifi,
  BadgeCheck,
  Star,
  Briefcase,
  Clock,
  Globe,
  Linkedin,
  MessageSquare,
  Building2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { StarRatingDisplay } from '@/components/reviews/StarRating'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewSummary } from '@/components/reviews/ReviewSummary'
import { formatDealSizeRange } from '@/lib/constants'
import type { Provider, Category, Service, Review, Industry } from '@/types/database'

interface ProviderProfileProps {
  provider: Provider
  categories: Category[]
  services: Service[]
  industries?: Industry[]
  reviews?: Review[]
  ratingDistribution?: Record<number, number>
}

export function ProviderProfile({
  provider,
  categories,
  services,
  industries = [],
  reviews = [],
  ratingDistribution,
}: ProviderProfileProps) {
  const initials = provider.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage
              src={provider.headshot_url || undefined}
              alt={provider.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl sm:text-3xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{provider.name}</h1>
              {provider.is_verified && (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {provider.is_featured && (
                <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            {provider.company_name && (
              <p className="text-lg text-muted-foreground">{provider.company_name}</p>
            )}

            {provider.tagline && (
              <p className="text-muted-foreground">{provider.tagline}</p>
            )}

            {(provider.rating_average !== null && provider.rating_average !== undefined) && (
              <StarRatingDisplay
                rating={provider.rating_average}
                count={provider.rating_count}
                size="md"
              />
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {(provider.city || provider.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {[provider.city, provider.state].filter(Boolean).join(', ')}
                </span>
              )}
              {provider.is_remote && (
                <span className="flex items-center gap-1">
                  <Wifi className="h-4 w-4" />
                  Works Remotely
                </span>
              )}
            </div>

            {/* External Links */}
            <div className="flex items-center gap-3 pt-2">
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {provider.linkedin && (
                <a
                  href={provider.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* About Section */}
        {provider.bio && (
          <section>
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {provider.bio.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => (
                <Badge key={service.id} variant="outline">
                  {service.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Industries Section */}
        {industries.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Industry Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge key={industry.id} variant="outline" className="bg-primary/5">
                  {industry.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section id="reviews">
          <Separator className="my-8" />
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews
            {provider.rating_count > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({provider.rating_count})
              </span>
            )}
          </h2>

          {/* Rating Summary */}
          {provider.rating_count > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <ReviewSummary
                  ratingAverage={provider.rating_average}
                  ratingCount={provider.rating_count}
                  ratingDistribution={ratingDistribution}
                />
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="mb-8">
            <ReviewList reviews={reviews} />
          </div>

          {/* Write a Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm
                providerId={provider.id}
                providerName={provider.name}
              />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Experience & Deal Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(provider.deal_size_min !== null ||
              provider.deal_size_max !== null) && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Deal Size</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDealSizeRange(
                      provider.deal_size_min,
                      provider.deal_size_max
                    )}
                  </p>
                </div>
              </div>
            )}

            {provider.years_experience && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.years_experience}+ years
                  </p>
                </div>
              </div>
            )}

            {provider.deals_closed && (
              <div className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Deals Closed</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.deals_closed}+
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact {provider.name.split(' ')[0]}</CardTitle>
          </CardHeader>
          <CardContent>
            <InquiryForm providerId={provider.id} providerName={provider.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
