'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'text-blue-600' },
  { value: 'contacted', label: 'Contacted', color: 'text-yellow-600' },
  { value: 'closed', label: 'Closed', color: 'text-gray-600' },
  { value: 'converted', label: 'Converted', color: 'text-green-600' },
]

interface StatusSelectorProps {
  inquiryId: string
  currentStatus: string
}

export function StatusSelector({ inquiryId, currentStatus }: StatusSelectorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus || 'new')

  async function handleStatusChange(newStatus: string) {
    setIsLoading(true)
    setStatus(newStatus)

    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update status')
      }

      toast({
        title: 'Status updated',
        description: `Inquiry marked as ${newStatus}`,
      })

      router.refresh()
    } catch {
      setStatus(currentStatus) // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === status)

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
        <SelectTrigger className={`w-32 h-8 text-xs ${currentOption?.color}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={option.color}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
