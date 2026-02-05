'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SuccessContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Give time for webhook to process
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            {type === 'boost'
              ? 'Your boost has been activated and is now live.'
              : 'Your subscription has been updated successfully.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {type === 'boost'
              ? 'Your profile will receive increased visibility based on the boost you purchased.'
              : 'You now have access to all the features included in your new plan.'}
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/portal/subscription">View Subscription</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/portal">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
