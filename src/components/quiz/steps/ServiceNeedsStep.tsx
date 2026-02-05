'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface ServiceNeedsStepProps {
  categories: Category[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function ServiceNeedsStep({ categories, selected, onChange }: ServiceNeedsStepProps) {
  function toggleCategory(slug: string) {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug))
    } else {
      onChange([...selected, slug])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select all the services you need help with (select at least one)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const isSelected = selected.includes(category.slug)
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.slug)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all',
                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <span className="font-medium">{category.name}</span>
              {category.description && (
                <span className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {category.description}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selected.length} service{selected.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
