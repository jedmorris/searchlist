import Link from 'next/link'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { Typewriter } from '@/components/home/Typewriter'
import { QuizCTA } from '@/components/quiz/QuizCTA'
import { createClient } from '@/lib/supabase/server'
import type { Category, Provider } from '@/types/database'

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error || !categories) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories as Category[]
}

async function getProviderCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_categories')
    .select('category_id, providers!inner(is_active)')

  if (error || !data) {
    console.error('Error fetching provider counts:', error)
    return {}
  }

  // Count active providers per category
  const counts: Record<string, number> = {}
  data.forEach((item: { category_id: string }) => {
    if (!counts[item.category_id]) {
      counts[item.category_id] = 0
    }
    counts[item.category_id]++
  })

  return counts
}

async function getFeaturedProviders(): Promise<Provider[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(3)

  if (error || !data) {
    console.error('Error fetching featured providers:', error)
    return []
  }

  return data as Provider[]
}

export default async function HomePage() {
  const [categories, providerCounts, featuredProviders] = await Promise.all([
    getCategories(),
    getProviderCounts(),
    getFeaturedProviders(),
  ])

  const benefits = [
    'Curated professionals who understand ETA',
    'Experienced with deals from $500K to $25M+',
    'Vetted for search fund and acquisition expertise',
    'Free to browse and connect',
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight min-h-[4em] md:min-h-[3em] lg:min-h-[2.5em] flex flex-col justify-center">
              <span>Connect with</span>
              <span className="text-primary block mt-2">
                <Typewriter
                  words={
                    categories.length > 0
                      ? categories.map((c) => c.name)
                      : [
                        'Lawyers',
                        'Quality of Earnings',
                        'CPAs',
                        'SBA Lenders',
                        'SBA Brokers',
                        'Financial Advisors',
                        'Insurance Agents',
                      ]
                  }
                />
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Helping businesses and individuals find specialized professionals for their acquisition journey in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/quiz">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find My Match
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#categories">
                  Browse Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz CTA Section */}
      <QuizCTA />

      {/* Categories Section */}
      <section id="categories" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the right professionals for every stage of your acquisition
              journey, from due diligence to post-close integration.
            </p>
          </div>
          <CategoryGrid categories={categories} providerCounts={providerCounts} />
        </div>
      </section>

      {/* Featured Providers Section */}
      {featuredProviders.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Providers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted professionals with proven track records in the search fund space.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/provider/${provider.slug}`}
                  className="bg-background rounded-lg border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      {provider.company_name && (
                        <p className="text-sm text-muted-foreground">
                          {provider.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {provider.tagline && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                      {provider.tagline}
                    </p>
                  )}
                  {provider.city && provider.state && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {provider.city}, {provider.state}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Are You a Service Provider?
            </h2>
            <p className="text-muted-foreground">
              Join our curated directory of professionals serving the search fund and
              lower middle market acquisition space. Reach entrepreneurs actively
              looking for your services.
            </p>
            <Button size="lg" asChild>
              <Link href="/about#providers">Get Listed</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
