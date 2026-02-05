'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { Industry } from '@/types/database'

export type SortOption = 'relevance' | 'rating' | 'reviews' | 'newest'

interface SearchFiltersProps {
  industries: Industry[]
  query: string
  totalResults?: number
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'newest', label: 'Newest' },
]

const RATING_OPTIONS = [
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
]

export function SearchFilters({ industries, query, totalResults }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'relevance'
  )
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '')
  const [hasReviews, setHasReviews] = useState(searchParams.get('hasReviews') === 'true')
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true')
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remote') === 'true')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    searchParams.get('industries')?.split(',').filter(Boolean) || []
  )

  const activeFilterCount = [
    minRating,
    hasReviews,
    verifiedOnly,
    remoteOnly,
    selectedIndustries.length > 0,
  ].filter(Boolean).length

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('q', query)

    if (sortBy !== 'relevance') params.set('sort', sortBy)
    if (minRating) params.set('minRating', minRating)
    if (hasReviews) params.set('hasReviews', 'true')
    if (verifiedOnly) params.set('verified', 'true')
    if (remoteOnly) params.set('remote', 'true')
    if (selectedIndustries.length > 0) params.set('industries', selectedIndustries.join(','))

    router.push(`/search?${params.toString()}`, { scroll: false })
  }, [query, sortBy, minRating, hasReviews, verifiedOnly, remoteOnly, selectedIndustries, router])

  const handleIndustryToggle = (industrySlug: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industrySlug)
        ? prev.filter((i) => i !== industrySlug)
        : [...prev, industrySlug]
    )
  }

  const clearFilters = () => {
    setSortBy('relevance')
    setMinRating('')
    setHasReviews(false)
    setVerifiedOnly(false)
    setRemoteOnly(false)
    setSelectedIndustries([])
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Sort by</Label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Minimum Rating</Label>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any rating</SelectItem>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Provider Status</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasReviews"
              checked={hasReviews}
              onCheckedChange={(checked) => setHasReviews(checked === true)}
            />
            <Label htmlFor="hasReviews" className="text-sm cursor-pointer">
              Has reviews
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
            />
            <Label htmlFor="verified" className="text-sm cursor-pointer">
              Verified only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={remoteOnly}
              onCheckedChange={(checked) => setRemoteOnly(checked === true)}
            />
            <Label htmlFor="remote" className="text-sm cursor-pointer">
              Remote-friendly
            </Label>
          </div>
        </div>
      </div>

      {/* Industries Filter */}
      {industries.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium">Industries</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {industries.map((industry) => (
                <div key={industry.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry.slug}`}
                    checked={selectedIndustries.includes(industry.slug)}
                    onCheckedChange={() => handleIndustryToggle(industry.slug)}
                  />
                  <Label
                    htmlFor={`industry-${industry.slug}`}
                    className="text-sm cursor-pointer"
                  >
                    {industry.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear all filters
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mobile Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sort */}
        <div className="hidden lg:flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Sort:</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Badges */}
        {minRating && (
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            {minRating}+ Stars
            <button
              onClick={() => setMinRating('')}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {hasReviews && (
          <Badge variant="secondary" className="gap-1">
            Has reviews
            <button
              onClick={() => setHasReviews(false)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {verifiedOnly && (
          <Badge variant="secondary" className="gap-1">
            Verified
            <button
              onClick={() => setVerifiedOnly(false)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {remoteOnly && (
          <Badge variant="secondary" className="gap-1">
            Remote
            <button
              onClick={() => setRemoteOnly(false)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {selectedIndustries.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            {selectedIndustries.length} {selectedIndustries.length === 1 ? 'industry' : 'industries'}
            <button
              onClick={() => setSelectedIndustries([])}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* Desktop Filters Panel Trigger */}
      <div className="hidden lg:block">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px]">
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results count on right for desktop */}
      {totalResults !== undefined && (
        <p className="text-sm text-muted-foreground hidden sm:block">
          {totalResults} {totalResults === 1 ? 'result' : 'results'}
        </p>
      )}
    </div>
  )
}
