'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewCard } from './ReviewCard'
import type { Review } from '@/types/database'

interface ReviewListProps {
  reviews: Review[]
  initialLimit?: number
}

export function ReviewList({ reviews, initialLimit = 5 }: ReviewListProps) {
  const [showAll, setShowAll] = useState(false)

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to leave a review!
        </p>
      </div>
    )
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, initialLimit)
  const hasMore = reviews.length > initialLimit

  return (
    <div className="space-y-6">
      {displayedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasMore && !showAll && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            Show all {reviews.length} reviews
          </Button>
        </div>
      )}
    </div>
  )
}
