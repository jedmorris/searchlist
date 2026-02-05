import { StarRating } from './StarRating'

interface ReviewSummaryProps {
  ratingAverage: number | null
  ratingCount: number
  ratingDistribution?: Record<number, number>
}

export function ReviewSummary({
  ratingAverage,
  ratingCount,
  ratingDistribution,
}: ReviewSummaryProps) {
  if (ratingCount === 0 || ratingAverage === null) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    )
  }

  // Calculate distribution percentages
  const distribution = ratingDistribution || {}
  const maxCount = Math.max(...Object.values(distribution), 1)

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Average Rating */}
      <div className="text-center sm:text-left">
        <div className="text-5xl font-bold">{ratingAverage.toFixed(1)}</div>
        <StarRating rating={ratingAverage} size="md" className="justify-center sm:justify-start mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          Based on {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      {ratingDistribution && (
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0
            const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-muted-foreground">
                  {stars} star{stars !== 1 && 's'}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="w-12 text-muted-foreground text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
