'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
  { value: 'converted', label: 'Converted' },
]

interface InquiryFiltersProps {
  currentStatus?: string
  counts: Record<string, number>
}

export function InquiryFilters({ currentStatus, counts }: InquiryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilterChange(status: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }

    router.push(`/admin/inquiries?${params.toString()}`)
  }

  const activeFilter = currentStatus || 'all'

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value
        const count = counts[option.value] || 0

        return (
          <button
            key={option.value}
            onClick={() => handleFilterChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            )}
          >
            {option.label}
            <Badge
              variant={isActive ? 'secondary' : 'outline'}
              className="h-5 min-w-5 px-1.5 text-xs"
            >
              {count}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
