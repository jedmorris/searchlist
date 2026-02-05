'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
import { US_STATES } from '@/lib/constants'
import type { Category } from '@/types/database'

interface SearchPageFiltersProps {
  categories: Category[]
}

export function SearchPageFilters({ categories }: SearchPageFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category')
  const currentState = searchParams.get('state')
  const currentRemote = searchParams.get('remote') === 'true'
  const currentVerified = searchParams.get('verified') === 'true'
  const currentMinRating = searchParams.get('minRating')

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/search?${params.toString()}`)
  }

  function clearFilters() {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    router.push(`/search?${params.toString()}`)
  }

  const activeFilterCount = [
    currentCategory,
    currentState,
    currentRemote ? 'remote' : null,
    currentVerified ? 'verified' : null,
    currentMinRating,
  ].filter(Boolean).length

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Category</Label>
        <Select
          value={currentCategory || ''}
          onValueChange={(value) => updateFilter('category', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Select
          value={currentState || ''}
          onValueChange={(value) => updateFilter('state', value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All states</SelectItem>
            {US_STATES.map((state) => (
              <SelectItem key={state.value} value={state.label}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Minimum Rating</Label>
        <div className="px-2">
          <Slider
            value={[currentMinRating ? parseFloat(currentMinRating) : 0]}
            min={0}
            max={5}
            step={0.5}
            onValueCommit={([value]) => {
              updateFilter('minRating', value > 0 ? value.toString() : null)
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Any</span>
            <span>{currentMinRating ? `${currentMinRating}+` : 'Any'}</span>
            <span>5</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={currentRemote}
            onCheckedChange={(checked) =>
              updateFilter('remote', checked ? 'true' : null)
            }
          />
          <Label htmlFor="remote" className="cursor-pointer">
            Works remotely
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={currentVerified}
            onCheckedChange={(checked) =>
              updateFilter('verified', checked ? 'true' : null)
            }
          />
          <Label htmlFor="verified" className="cursor-pointer">
            Verified only
          </Label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear all filters
          </Button>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
