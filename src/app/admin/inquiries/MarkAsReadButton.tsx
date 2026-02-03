'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface MarkAsReadButtonProps {
  inquiryId: string
}

export function MarkAsReadButton({ inquiryId }: MarkAsReadButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleMarkAsRead() {
    setIsLoading(true)

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('inquiries') as any)
      .update({ is_read: true })
      .eq('id', inquiryId)

    router.refresh()
    setIsLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleMarkAsRead}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Check className="h-4 w-4 mr-1" />
          Mark as Read
        </>
      )}
    </Button>
  )
}
