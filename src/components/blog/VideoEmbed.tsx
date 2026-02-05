'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoEmbedProps {
  videoId: string
  title: string
  thumbnailUrl?: string
  className?: string
}

export function VideoEmbed({ videoId, title, thumbnailUrl, className }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Default to YouTube's maxresdefault thumbnail
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (isPlaying) {
    return (
      <div className={cn('relative w-full aspect-video rounded-xl overflow-hidden bg-black', className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className={cn(
        'relative w-full aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer',
        className
      )}
      aria-label={`Play video: ${title}`}
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          // Fallback to hqdefault if maxresdefault doesn't exist
          const target = e.target as HTMLImageElement
          if (target.src.includes('maxresdefault')) {
            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          }
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110 shadow-2xl">
          <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Title overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-medium text-lg line-clamp-2 text-left">{title}</p>
      </div>
    </button>
  )
}
