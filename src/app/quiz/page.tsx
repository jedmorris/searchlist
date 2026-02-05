import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { QuizWizard } from '@/components/quiz/QuizWizard'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Find Your Perfect Match | ${SITE_CONFIG.name}`,
  description: 'Take our quick quiz to find the best ETA service providers for your specific needs. Get personalized recommendations based on your requirements.',
}

export default async function QuizPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon')
    .order('display_order')

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Find Your Perfect Service Provider
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Answer a few quick questions and we&apos;ll match you with the best
          ETA service providers for your specific needs.
        </p>
      </div>

      <QuizWizard categories={categories || []} />
    </div>
  )
}
