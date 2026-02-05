'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating)
        const partial = index === Math.floor(rating) && rating % 1 > 0

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            className={cn(
              'relative',
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'cursor-default'
            )}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                'text-muted-foreground/30'
              )}
            />
            {/* Foreground star (filled) */}
            {(filled || partial) && (
              <Star
                className={cn(
                  sizeClasses[size],
                  'absolute top-0 left-0 text-yellow-500 fill-yellow-500',
                  partial && 'clip-path-[inset(0_50%_0_0)]'
                )}
                style={
                  partial
                    ? {
                        clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
                      }
                    : undefined
                }
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

interface StarRatingDisplayProps {
  rating: number | null
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function StarRatingDisplay({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}: StarRatingDisplayProps) {
  if (rating === null || rating === undefined) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        No reviews yet
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <StarRating rating={rating} size={size} />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  )
}
