import Link from 'next/link'
import { Users, MessageSquare, FolderTree, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Inquiry, Provider } from '@/types/database'

interface Stats {
  providers: number
  inquiries: number
  categories: number
  unreadInquiries: number
}

type RecentInquiry = Inquiry & {
  providers: Pick<Provider, 'name'> | null
}

async function getStats(): Promise<Stats> {
  const supabase = await createClient()

  const [providersResult, inquiriesResult, categoriesResult, unreadResult] =
    await Promise.all([
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false),
    ])

  return {
    providers: providersResult.count || 0,
    inquiries: inquiriesResult.count || 0,
    categories: categoriesResult.count || 0,
    unreadInquiries: unreadResult.count || 0,
  }
}

async function getRecentInquiries(): Promise<RecentInquiry[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inquiries')
    .select('*, providers(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (data || []) as RecentInquiry[]
}

export default async function AdminDashboard() {
  const [stats, recentInquiries] = await Promise.all([
    getStats(),
    getRecentInquiries(),
  ])

  const statCards = [
    {
      title: 'Total Providers',
      value: stats.providers,
      icon: Users,
      href: '/admin/providers',
    },
    {
      title: 'Total Inquiries',
      value: stats.inquiries,
      icon: MessageSquare,
      href: '/admin/inquiries',
      badge: stats.unreadInquiries > 0 ? `${stats.unreadInquiries} unread` : undefined,
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: FolderTree,
      href: '/admin/categories',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your ETA Services Directory
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.badge && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {stat.badge}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Inquiries
          </CardTitle>
          <CardDescription>
            Latest inquiries from potential clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInquiries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No inquiries yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{inquiry.sender_name}</p>
                      {!inquiry.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      To: {inquiry.providers?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {inquiry.message}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              <Link
                href="/admin/inquiries"
                className="block text-center text-sm text-primary hover:underline pt-2"
              >
                View all inquiries
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
