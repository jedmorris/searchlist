import Link from 'next/link'
import { Sparkles, ArrowRight, Clock, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function QuizCTA() {
  const features = [
    {
      icon: Clock,
      title: '2 Minutes',
      description: 'Quick assessment',
    },
    {
      icon: Target,
      title: 'Personalized',
      description: 'Tailored matches',
    },
    {
      icon: Users,
      title: 'Top 5 Matches',
      description: 'Best fit providers',
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-primary/20 bg-background/80 backdrop-blur">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Smart Matching
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Not Sure Where to Start?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Take our quick quiz and get matched with the best service providers
                  for your specific acquisition needs. It only takes 2 minutes.
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild>
                  <Link href="/quiz">
                    Take the Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Right Visual */}
              <div className="hidden md:flex flex-col items-center justify-center w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full">
                <Sparkles className="h-16 w-16 text-primary" />
                <p className="text-sm font-medium text-primary mt-2">Find Your Match</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
