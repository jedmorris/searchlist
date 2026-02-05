'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, FolderTree, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchResult {
  type: 'category' | 'provider'
  id: string
  name: string
  slug: string
  subtitle?: string
}

interface SearchAutocompleteProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export function SearchAutocomplete({
  placeholder = 'Search providers, categories...',
  className,
  onSearch,
}: SearchAutocompleteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchProviders = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&mode=quick`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProviders(query)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, searchProviders])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery('')
    if (result.type === 'category') {
      router.push(`/${result.slug}`)
    } else {
      router.push(`/provider/${result.slug}`)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      handleSelect(results[selectedIndex])
    } else if (query.trim()) {
      setOpen(false)
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-9 pr-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                selectedIndex === index
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              )}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {result.type === 'category' ? (
                <FolderTree className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.name}</p>
                {result.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
