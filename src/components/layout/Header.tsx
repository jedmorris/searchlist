'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/forms/SearchBar'

const navigation = [
  { name: 'Find My Match', href: '/quiz', highlight: true },
  { name: 'Browse Services', href: '/#categories' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const pathname = usePathname()
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Search List</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                item.highlight
                  ? 'text-primary hover:text-primary/80'
                  : 'hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : !item.highlight && 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Desktop Search */}
          <div className="hidden md:block md:w-64 lg:w-80">
            <SearchBar />
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary p-2 rounded-md',
                      pathname === item.href
                        ? 'text-primary bg-primary/10'
                        : item.highlight
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="border-t px-4 py-3 md:hidden">
          <SearchBar onSearch={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  )
}
