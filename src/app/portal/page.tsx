import Link from 'next/link'
import { MessageSquare, User, TrendingUp, Star, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Inquiry, Provider } from '@/types/database'

async function getPortalStats(providerId: string) {
  const supabase = await createClient()

  // Get inquiry counts
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, is_read, status, created_at')
    .eq('provider_id', providerId)

  const totalInquiries = inquiries?.length || 0
  const unreadInquiries = inquiries?.filter((i: Pick<Inquiry, 'is_read'>) => !i.is_read).length || 0
  const recentInquiries = inquiries?.filter((i: Pick<Inquiry, 'created_at'>) => {
    const date = new Date(i.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date > weekAgo
  }).length || 0

  // Get provider info
  const { data: provider } = await supabase
    .from('providers')
    .select('name, rating_average, rating_count, is_featured, is_verified')
    .eq('id', providerId)
    .single()

  // Get review count
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact' })
    .eq('provider_id', providerId)
    .eq('is_approved', true)

  return {
    totalInquiries,
    unreadInquiries,
    recentInquiries,
    provider: provider as Pick<Provider, 'name' | 'rating_average' | 'rating_count' | 'is_featured' | 'is_verified'> | null,
    reviewCount: reviewCount || 0,
  }
}

export default async function PortalDashboard() {
  const profile = await getUserProfile()

  if (!profile?.provider_id) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Provider Portal</h1>
        <p className="text-muted-foreground mb-6">
          Your account is not yet linked to a provider profile. Please contact an administrator to complete your setup.
        </p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  const stats = await getPortalStats(profile.provider_id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{stats.provider?.name ? `, ${stats.provider.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your profile activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unreadInquiries} unread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentInquiries}</div>
            <p className="text-xs text-muted-foreground">new inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.provider?.rating_average?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.reviewCount} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.provider?.is_featured ? 'Featured' : 'Active'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.provider?.is_verified ? 'Verified' : 'Not verified'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Manage Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Keep your profile up to date to attract more clients. Update your bio, services, and contact information.
            </p>
            <Button asChild>
              <Link href="/portal/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              View Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {stats.unreadInquiries > 0
                ? `You have ${stats.unreadInquiries} unread inquiries waiting for your response.`
                : 'Check your inquiry history and respond to potential clients.'}
            </p>
            <Button asChild variant={stats.unreadInquiries > 0 ? 'default' : 'outline'}>
              <Link href="/portal/inquiries">
                View Inquiries
                {stats.unreadInquiries > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {stats.unreadInquiries}
                  </span>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
