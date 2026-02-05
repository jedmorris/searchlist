'use client'

import { cn } from '@/lib/utils'
import { QUIZ_TIMELINES } from '@/lib/constants'
import { Clock } from 'lucide-react'
import type { QuizTimeline } from '@/types/database'

interface TimelineStepProps {
  selected: QuizTimeline | null
  onChange: (selected: QuizTimeline | null) => void
}

export function TimelineStep({ selected, onChange }: TimelineStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        How soon do you need help? This helps providers prioritize your request (optional)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUIZ_TIMELINES.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(isSelected ? null : option.value as QuizTimeline)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{option.label}</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                {option.description}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        You can skip this step if you&apos;re flexible on timing
      </p>
    </div>
  )
}
