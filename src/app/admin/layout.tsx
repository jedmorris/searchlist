import Link from 'next/link'
import { LayoutDashboard, Users, MessageSquare, FolderTree, LogOut, UserCog, Tag, BarChart3, Mail, Star, Sparkles, Building2, Video, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Providers', href: '/admin/providers', icon: Users },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Quiz Leads', href: '/admin/quiz-leads', icon: Sparkles },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Blog', href: '/admin/blog', icon: Video },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Services', href: '/admin/services', icon: Tag },
  { name: 'Industries', href: '/admin/industries', icon: Building2 },
  { name: 'Invitations', href: '/admin/invitations', icon: Mail },
  { name: 'Admin Users', href: '/admin/users', icon: UserCog },
  { name: 'YouTube', href: '/admin/settings/youtube', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No user means we're on the login page (middleware redirects unauthenticated users there)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        <div className="p-6">
          <h2 className="font-semibold text-lg">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <nav className="flex justify-around p-2">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-xs rounded-md hover:bg-muted transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">{children}</main>
    </div>
  )
}
