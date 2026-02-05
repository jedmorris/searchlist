import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Mail, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function PortalSetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login?redirect=/portal')
  }

  // Get user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('user_profiles') as any)
    .select('*, providers(id, name)')
    .eq('id', user.id)
    .single()

  // If they already have a provider linked, redirect to portal
  if (profile?.provider_id) {
    redirect('/portal')
  }

  // Check if there's a pending invitation for this email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invitation } = await (supabase.from('provider_invitations') as any)
    .select('*, providers(id, name)')
    .eq('email', user.email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Search List</h1>
          <p className="text-muted-foreground">
            Complete your account setup to access the Provider Portal
          </p>
        </div>

        {invitation ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Invitation Found
              </CardTitle>
              <CardDescription>
                You have been invited to manage the profile for{' '}
                <strong>{invitation.providers?.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to accept your invitation and start managing your
                provider profile, view inquiries, and access premium features.
              </p>
              <Button asChild className="w-full">
                <Link href={`/auth/accept-invitation?token=${invitation.token}`}>
                  Accept Invitation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Account Setup Required</CardTitle>
              <CardDescription>
                Your account is not linked to a provider profile yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Provider Profile Linked</AlertTitle>
                <AlertDescription>
                  To access the Provider Portal, your account needs to be linked to a
                  provider profile. This is typically done through an invitation from a
                  Search List administrator.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-medium">How to get access:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong>Request an invitation</strong> - Contact us at{' '}
                    <a
                      href="mailto:support@searchlist.com"
                      className="text-primary hover:underline"
                    >
                      support@searchlist.com
                    </a>{' '}
                    to request access
                  </li>
                  <li>
                    <strong>Check your email</strong> - If you&apos;ve already been invited,
                    check your inbox for an invitation link
                  </li>
                  <li>
                    <strong>Use a different account</strong> - If you received an invitation
                    at a different email address, sign out and sign in with that email
                  </li>
                </ol>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild className="flex-1">
                  <a href="mailto:support@searchlist.com?subject=Provider%20Portal%20Access%20Request">
                    <Mail className="mr-2 h-4 w-4" />
                    Request Access
                  </a>
                </Button>
                <form action="/api/auth/signout" method="post" className="flex-1">
                  <Button variant="ghost" type="submit" className="w-full">
                    Sign Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Looking to find a service provider?{' '}
          <Link href="/" className="text-primary hover:underline">
            Browse our directory
          </Link>
        </p>
      </div>
    </div>
  )
}
