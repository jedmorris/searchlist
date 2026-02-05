'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const STORAGE_KEY = 'searchlist_saved_providers'

interface SavedProvidersContextType {
  savedProviderIds: Set<string>
  saveProvider: (id: string) => void
  unsaveProvider: (id: string) => void
  toggleSaved: (id: string) => void
  isSaved: (id: string) => boolean
  clearAll: () => void
}

const SavedProvidersContext = createContext<SavedProvidersContextType | undefined>(undefined)

export function SavedProvidersProvider({ children }: { children: ReactNode }) {
  const [savedProviderIds, setSavedProviderIds] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        setSavedProviderIds(new Set(ids))
      }
    } catch {
      // Invalid data in localStorage, ignore
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage when savedProviderIds changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(savedProviderIds)))
    }
  }, [savedProviderIds, isHydrated])

  const saveProvider = useCallback((id: string) => {
    setSavedProviderIds((prev) => new Set([...Array.from(prev), id]))
  }, [])

  const unsaveProvider = useCallback((id: string) => {
    setSavedProviderIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggleSaved = useCallback((id: string) => {
    setSavedProviderIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const isSaved = useCallback(
    (id: string) => savedProviderIds.has(id),
    [savedProviderIds]
  )

  const clearAll = useCallback(() => {
    setSavedProviderIds(new Set())
  }, [])

  return (
    <SavedProvidersContext.Provider
      value={{
        savedProviderIds,
        saveProvider,
        unsaveProvider,
        toggleSaved,
        isSaved,
        clearAll,
      }}
    >
      {children}
    </SavedProvidersContext.Provider>
  )
}

export function useSavedProviders() {
  const context = useContext(SavedProvidersContext)
  if (context === undefined) {
    throw new Error('useSavedProviders must be used within a SavedProvidersProvider')
  }
  return context
}
