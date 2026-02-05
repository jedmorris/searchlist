import Link from 'next/link'
import { Clock, Calendar, Play, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types/database'

interface BlogPostCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const thumbnail = `https://img.youtube.com/vi/${post.youtube_video_id}/maxresdefault.jpg`

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className={cn(
          'overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 h-full',
          featured && 'md:flex md:flex-row'
        )}
      >
        {/* Thumbnail */}
        <div
          className={cn(
            'relative aspect-video bg-muted overflow-hidden',
            featured && 'md:w-2/5 md:aspect-auto md:min-h-[280px]'
          )}
        >
          <img
            src={thumbnail}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src.includes('maxresdefault')) {
                target.src = `https://img.youtube.com/vi/${post.youtube_video_id}/hqdefault.jpg`
              }
            }}
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Duration badge */}
          {post.video_duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded">
              {post.video_duration}
            </div>
          )}
          {/* Featured badge */}
          {post.is_featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black gap-1">
                <Star className="h-3 w-3" fill="currentColor" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className={cn('p-5', featured && 'md:w-3/5 md:flex md:flex-col md:justify-center')}>
          {/* Category */}
          {post.category && (
            <Badge variant="secondary" className="mb-3 text-xs">
              {post.category}
            </Badge>
          )}

          {/* Title */}
          <h3
            className={cn(
              'font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors',
              featured ? 'text-2xl' : 'text-lg'
            )}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className={cn(
                'text-muted-foreground mb-4',
                featured ? 'line-clamp-3' : 'line-clamp-2 text-sm'
              )}
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            )}
            {post.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time_minutes} min read
              </span>
            )}
          </div>

          {/* Tags */}
          {featured && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
