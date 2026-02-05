import Link from 'next/link'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface TestimonialData {
  id: string
  rating: number
  title: string | null
  content: string
  author_name: string
  created_at: string
  provider: {
    id: string
    name: string
    slug: string
    company_name: string | null
  }
}

interface TestimonialsSectionProps {
  testimonials: TestimonialData[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Clients Are Saying</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real feedback from entrepreneurs and business buyers who found their perfect match.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const initials = testimonial.author_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Truncate content to a reasonable length for display
  const maxLength = 200
  const truncatedContent =
    testimonial.content.length > maxLength
      ? testimonial.content.substring(0, maxLength).trim() + '...'
      : testimonial.content

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Quote Icon & Rating */}
        <div className="flex items-start justify-between mb-4">
          <Quote className="h-8 w-8 text-primary/20" />
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= testimonial.rating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 mb-4">
          {testimonial.title && (
            <p className="font-semibold mb-2">{testimonial.title}</p>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">
            &ldquo;{truncatedContent}&rdquo;
          </p>
        </div>

        {/* Author & Provider */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{testimonial.author_name}</p>
              <Link
                href={`/provider/${testimonial.provider.slug}`}
                className="text-xs text-primary hover:underline truncate block"
              >
                Review for {testimonial.provider.name}
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
