import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, Target, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about ETA Services Directory - connecting entrepreneurs with trusted service providers for business acquisitions.',
}

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Curated Quality',
      description:
        'Every provider is manually reviewed to ensure they have genuine experience in the ETA and lower middle market space.',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description:
        'Built by and for the ETA community - we understand the unique needs of search fund entrepreneurs and independent sponsors.',
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description:
        'We verify credentials and experience to help you make informed decisions about who to work with on your acquisition.',
    },
  ]

  const forProviders = [
    'Reach entrepreneurs actively searching for services',
    'No subscription fees - free to be listed',
    'Qualified leads directly to your inbox',
    'Showcase your ETA-specific expertise',
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              About ETA Services Directory
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting entrepreneurs with trusted professionals who understand
              the unique challenges of acquiring and operating a small business.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p>
                The ETA (Entrepreneurship Through Acquisition) space is growing
                rapidly, but finding service providers who truly understand the
                nuances of lower middle market transactions can be challenging.
              </p>
              <p>
                We created ETA Services Directory to solve this problem. Our
                curated directory features professionals who have demonstrated
                experience working with search fund entrepreneurs, independent
                sponsors, and small business acquirers.
              </p>
              <p>
                Whether you&apos;re looking for an M&A attorney who understands SBA
                deals, a QoE provider who knows what matters for a $2M acquisition,
                or a lender who specializes in first-time buyers, we&apos;ve got you
                covered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-12 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers */}
      <section id="providers" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">For Service Providers</h2>
              <p className="text-muted-foreground text-lg">
                Join our curated directory and connect with entrepreneurs
                actively searching for your services.
              </p>
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                {forProviders.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-8">
                <h3 className="font-semibold text-lg mb-4">How to Get Listed</h3>
                <p className="text-muted-foreground mb-6">
                  We maintain a curated directory to ensure quality. To be
                  considered for listing, please reach out to us with information
                  about your practice and experience in the ETA space.
                </p>
                <Button asChild>
                  <a href="mailto:hello@etadirectory.com">
                    Contact Us to Apply
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">
              Ready to Find Your Service Provider?
            </h2>
            <p className="text-muted-foreground">
              Browse our curated directory of professionals who specialize in
              helping entrepreneurs acquire and operate small businesses.
            </p>
            <Button size="lg" asChild>
              <Link href="/#categories">
                Browse Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
