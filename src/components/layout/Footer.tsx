import Link from 'next/link'

const categories = [
  { name: 'Legal / M&A Attorneys', href: '/legal' },
  { name: 'Quality of Earnings', href: '/qoe' },
  { name: 'Accounting & CPA', href: '/accounting' },
  { name: 'SBA Lenders', href: '/sba-lenders' },
  { name: 'Business Brokers', href: '/brokers' },
  { name: 'Insurance', href: '/insurance' },
]

const resources = [
  { name: 'About', href: '/about' },
  { name: 'For Providers', href: '/about#providers' },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-primary">
              ETA Directory
            </Link>
            <p className="text-sm text-muted-foreground">
              Find trusted service providers for your business acquisition
              journey.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Are you a service provider? We&apos;d love to hear from you.
            </p>
            <Link
              href="/about#providers"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              Get Listed
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Search List. All rights
            reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
