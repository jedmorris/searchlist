'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, MessageSquare, CreditCard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const portalNav = [
  { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { name: 'My Profile', href: '/portal/profile', icon: User },
  { name: 'Inquiries', href: '/portal/inquiries', icon: MessageSquare },
  { name: 'Subscription', href: '/portal/subscription', icon: CreditCard },
]

interface PortalNavProps {
  userEmail: string
  providerName?: string
}

export function PortalNav({ userEmail, providerName }: PortalNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        <div className="p-6">
          <h2 className="font-semibold text-lg">Provider Portal</h2>
          <p className="text-sm text-muted-foreground truncate">
            {providerName || userEmail}
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {portalNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
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
          {portalNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 text-xs rounded-md transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
