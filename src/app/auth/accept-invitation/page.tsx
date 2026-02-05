'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof formSchema>

interface Invitation {
  id: string
  email: string
  provider_id: string | null
  expires_at: string
  accepted_at: string | null
  providers?: { name: string } | null
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('No invitation token provided')
        setLoading(false)
        return
      }

      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('provider_invitations') as any)
        .select('*, providers(name)')
        .eq('token', token)
        .single()

      if (error || !data) {
        setError('Invalid invitation token')
        setLoading(false)
        return
      }

      if (data.accepted_at) {
        setError('This invitation has already been used')
        setLoading(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      setInvitation(data as Invitation)
      setLoading(false)
    }

    verifyToken()
  }, [token])

  async function onSubmit(data: FormData) {
    if (!invitation || !token) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: data.password,
        options: {
          data: {
            display_name: invitation.providers?.name || invitation.email,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Update user profile to provider role with linked provider_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (supabase.from('user_profiles') as any)
        .update({
          role: 'provider',
          provider_id: invitation.provider_id,
          display_name: invitation.providers?.name || invitation.email,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      }

      // Mark invitation as accepted
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('provider_invitations') as any)
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', token)

      setSuccess(true)
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      })

      // Redirect to portal after a short delay
      setTimeout(() => {
        router.push('/portal')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Account Created!</CardTitle>
            <CardDescription>
              Please check your email to verify your account. You will be redirected to the portal shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            {invitation?.providers?.name
              ? `Create your account to manage ${invitation.providers.name}`
              : `Create your account for ${invitation?.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{invitation?.email}</p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  )
}
