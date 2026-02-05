'use client'

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSavedProviders } from '@/contexts/SavedProvidersContext'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  providerId: string
  size?: 'sm' | 'default'
  className?: string
}

export function SaveButton({ providerId, size = 'sm', className }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSavedProviders()
  const saved = isSaved(providerId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaved(providerId)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'shrink-0 transition-colors',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        saved && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved providers' : 'Save provider'}
    >
      <Heart
        className={cn(
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          saved && 'fill-current'
        )}
      />
    </Button>
  )
}
