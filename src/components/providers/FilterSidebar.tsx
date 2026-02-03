'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { US_STATES, DEAL_SIZE_RANGES } from '@/lib/constants'
import type { Service } from '@/types/database'

interface FilterSidebarProps {
  categorySlug: string
  services?: Service[]
  currentState?: string
}

export function FilterSidebar({
  categorySlug,
  services = [],
  currentState,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState(currentState || '')
  const [dealSizeMin, setDealSizeMin] = useState(searchParams.get('dealMin') || '')
  const [dealSizeMax, setDealSizeMax] = useState(searchParams.get('dealMax') || '')
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remote') === 'true')
  const [selectedServices, setSelectedServices] = useState<string[]>(
    searchParams.get('services')?.split(',').filter(Boolean) || []
  )

  const hasActiveFilters =
    state || dealSizeMin || dealSizeMax || remoteOnly || selectedServices.length > 0

  useEffect(() => {
    const params = new URLSearchParams()

    if (dealSizeMin) params.set('dealMin', dealSizeMin)
    if (dealSizeMax) params.set('dealMax', dealSizeMax)
    if (remoteOnly) params.set('remote', 'true')
    if (selectedServices.length > 0) params.set('services', selectedServices.join(','))

    const queryString = params.toString()
    const basePath = state ? `/${categorySlug}/${state}` : `/${categorySlug}`
    const newPath = queryString ? `${basePath}?${queryString}` : basePath

    router.push(newPath, { scroll: false })
  }, [categorySlug, state, dealSizeMin, dealSizeMax, remoteOnly, selectedServices, router])

  const handleServiceToggle = (serviceSlug: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceSlug)
        ? prev.filter((s) => s !== serviceSlug)
        : [...prev, serviceSlug]
    )
  }

  const clearFilters = () => {
    setState('')
    setDealSizeMin('')
    setDealSizeMax('')
    setRemoteOnly(false)
    setSelectedServices([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <Separator />

      {/* State Filter */}
      <div className="space-y-3">
        <Label>Location</Label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger>
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All states</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deal Size Filter */}
      <div className="space-y-3">
        <Label>Deal Size</Label>
        <Select
          value={dealSizeMin ? `${dealSizeMin}-${dealSizeMax || ''}` : ''}
          onValueChange={(value) => {
            if (!value) {
              setDealSizeMin('')
              setDealSizeMax('')
            } else {
              const range = DEAL_SIZE_RANGES.find(
                (r) => `${r.min}-${r.max || ''}` === value
              )
              if (range) {
                setDealSizeMin(range.min.toString())
                setDealSizeMax(range.max?.toString() || '')
              }
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any deal size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any deal size</SelectItem>
            {DEAL_SIZE_RANGES.map((range) => (
              <SelectItem
                key={`${range.min}-${range.max}`}
                value={`${range.min}-${range.max || ''}`}
              >
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Remote Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={remoteOnly}
          onCheckedChange={(checked) => setRemoteOnly(checked === true)}
        />
        <Label htmlFor="remote" className="text-sm cursor-pointer">
          Remote-friendly only
        </Label>
      </div>

      {/* Services Filter */}
      {services.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Services</Label>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.slug}
                    checked={selectedServices.includes(service.slug)}
                    onCheckedChange={() => handleServiceToggle(service.slug)}
                  />
                  <Label htmlFor={service.slug} className="text-sm cursor-pointer">
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
