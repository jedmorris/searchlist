'use client'

import { useState } from 'react'
import { ThumbsUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { StarRating } from './StarRating'
import type { Review } from '@/types/database'

interface ReviewCardProps {
  review: Review
  showProviderName?: boolean
  providerName?: string
}

export function ReviewCard({
  review,
  showProviderName = false,
  providerName,
}: ReviewCardProps) {
  const { toast } = useToast()
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)

  async function handleHelpful() {
    if (hasVoted || voting) return

    setVoting(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Already voted') {
          setHasVoted(true)
          toast({
            title: 'Already voted',
            description: 'You have already marked this review as helpful.',
          })
          return
        }
        throw new Error(data.error || 'Failed to vote')
      }

      setHelpfulCount((prev) => prev + 1)
      setHasVoted(true)
      toast({
        title: 'Thanks for your feedback!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setVoting(false)
    }
  }

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="border-b pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="sm" />
            {review.is_featured && (
              <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-xs">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          {review.title && (
            <h4 className="font-semibold">{review.title}</h4>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{review.author_name}</span>
            <span>-</span>
            <span>{formattedDate}</span>
            {showProviderName && providerName && (
              <>
                <span>-</span>
                <span>for {providerName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
        {review.content}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleHelpful}
          disabled={hasVoted || voting}
        >
          <ThumbsUp
            className={`h-4 w-4 mr-1 ${hasVoted ? 'fill-current' : ''}`}
          />
          Helpful ({helpfulCount})
        </Button>
      </div>
    </div>
  )
}
