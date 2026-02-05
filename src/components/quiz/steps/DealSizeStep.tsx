'use client'

import { cn } from '@/lib/utils'
import { QUIZ_DEAL_SIZES } from '@/lib/constants'
import type { DealSizeRange } from '@/types/database'

interface DealSizeStepProps {
  selected: DealSizeRange | null
  onChange: (selected: DealSizeRange | null) => void
}

export function DealSizeStep({ selected, onChange }: DealSizeStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This helps us match you with providers experienced in your deal size range (optional)
      </p>
      <div className="grid grid-cols-1 gap-3">
        {QUIZ_DEAL_SIZES.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(isSelected ? null : option.value as DealSizeRange)}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 text-left transition-all',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <div>
                <span className="font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {option.description}
                </span>
              </div>
              {isSelected && (
                <span className="text-primary text-sm font-medium">Selected</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        You can skip this step if you&apos;re not sure yet
      </p>
    </div>
  )
}
