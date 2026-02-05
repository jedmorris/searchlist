'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { StarRating } from './StarRating'

const formSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000),
  author_name: z.string().min(2, 'Name is required'),
  author_email: z.string().email('Valid email is required'),
})

type FormData = z.infer<typeof formSchema>

interface ReviewFormProps {
  providerId: string
  providerName: string
  onSuccess?: () => void
}

export function ReviewForm({ providerId, providerName, onSuccess }: ReviewFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
      author_name: '',
      author_email: '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          provider_id: providerId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      setSubmitted(true)
      toast({
        title: 'Review submitted',
        description: 'Your review will be visible after moderation.',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Thank you for your review!</h3>
        <p className="text-muted-foreground">
          Your review has been submitted and will be visible after moderation.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating *</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={field.value}
                    size="lg"
                    interactive
                    onChange={field.onChange}
                  />
                  {field.value > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {field.value} {field.value === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="author_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder={`What's most important to know about ${providerName.split(' ')[0]}?`}
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience working with this provider..."
                  className="min-h-[120px]"
                  maxLength={2000}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your review will be moderated before being published. Your email will not be displayed publicly.
        </p>
      </form>
    </Form>
  )
}
