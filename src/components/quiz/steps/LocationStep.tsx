'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { US_STATES } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wifi, MapPin } from 'lucide-react'

interface LocationStepProps {
  selected: string | null
  onChange: (selected: string | null) => void
}

export function LocationStep({ selected, onChange }: LocationStepProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStates = US_STATES.filter(
    (state) =>
      state.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.abbr.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isRemote = selected === 'remote'

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Where are you looking for service providers? (optional)
      </p>

      {/* Remote option */}
      <button
        type="button"
        onClick={() => onChange(isRemote ? null : 'remote')}
        className={cn(
          'w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all',
          'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isRemote
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background'
        )}
      >
        <Wifi className="h-5 w-5 text-muted-foreground" />
        <div>
          <span className="font-medium">Remote / Anywhere</span>
          <span className="text-sm text-muted-foreground ml-2">
            I&apos;m open to working with providers remotely
          </span>
        </div>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or select a state</span>
        </div>
      </div>

      {/* State search */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search states..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-2 space-y-1">
            {filteredStates.map((state) => {
              const isSelected = selected === state.abbr
              return (
                <button
                  key={state.value}
                  type="button"
                  onClick={() => onChange(isSelected ? null : state.abbr)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors',
                    'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                    isSelected && 'bg-primary/10 text-primary'
                  )}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{state.label}</span>
                  <span className="text-sm text-muted-foreground">{state.abbr}</span>
                </button>
              )
            })}
            {filteredStates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No states found
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <p className="text-xs text-muted-foreground">
        You can skip this step if location doesn&apos;t matter
      </p>
    </div>
  )
}
