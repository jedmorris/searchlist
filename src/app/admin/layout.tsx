import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, MessageSquare, FolderTree, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Providers', href: '/admin/providers', icon: Users },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
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

  // Allow access to login page without auth
  const isLoginPage =
    typeof window === 'undefined'
      ? false
      : window.location.pathname === '/admin/login'

  if (!user && !isLoginPage) {
    // Check if this is being rendered server-side
    const headers = await import('next/headers').then((mod) => mod.headers())
    const pathname = headers.get('x-pathname') || ''
    if (pathname !== '/admin/login') {
      redirect('/admin/login')
    }
  }

  // For login page, render without admin layout
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
