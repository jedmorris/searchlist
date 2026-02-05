'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ServiceNeedsStep } from './steps/ServiceNeedsStep'
import { DealSizeStep } from './steps/DealSizeStep'
import { LocationStep } from './steps/LocationStep'
import { TimelineStep } from './steps/TimelineStep'
import { ContactStep } from './steps/ContactStep'
import { QuizResults } from './QuizResults'
import type { Category, QuizMatchedProvider, DealSizeRange, QuizTimeline } from '@/types/database'

export interface QuizData {
  serviceNeeds: string[]
  dealSizeRange: DealSizeRange | null
  locationPreference: string | null
  timeline: QuizTimeline | null
  name: string
  email: string
  phone: string
  companyName: string
  additionalNotes: string
}

interface QuizWizardProps {
  categories: Category[]
}

const STEPS = [
  { id: 'services', title: 'Service Needs', description: 'What type of help are you looking for?' },
  { id: 'dealSize', title: 'Deal Size', description: 'What is your expected transaction size?' },
  { id: 'location', title: 'Location', description: 'Where are you looking for service providers?' },
  { id: 'timeline', title: 'Timeline', description: 'When do you need help?' },
  { id: 'contact', title: 'Contact Info', description: 'How can we connect you with providers?' },
]

export function QuizWizard({ categories }: QuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [quizData, setQuizData] = useState<QuizData>({
    serviceNeeds: [],
    dealSizeRange: null,
    locationPreference: null,
    timeline: null,
    name: '',
    email: '',
    phone: '',
    companyName: '',
    additionalNotes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<{
    leadId: string | null
    providers: (QuizMatchedProvider & { categories: Category[] })[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  function updateQuizData<K extends keyof QuizData>(key: K, value: QuizData[K]) {
    setQuizData((prev) => ({ ...prev, [key]: value }))
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 0:
        return quizData.serviceNeeds.length > 0
      case 1:
        return true // Deal size is optional
      case 2:
        return true // Location is optional
      case 3:
        return true // Timeline is optional
      case 4:
        return quizData.name.trim() !== '' && quizData.email.trim() !== ''
      default:
        return false
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  async function handleSubmit() {
    if (!canProceed()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz')
      }

      setResults({
        leadId: data.leadId,
        providers: data.providers,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If we have results, show the results component
  if (results) {
    return (
      <QuizResults
        providers={results.providers}
        leadId={results.leadId}
        quizData={quizData}
      />
    )
  }

  const step = STEPS[currentStep]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-4">
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-base mt-1">{step.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <ServiceNeedsStep
              categories={categories}
              selected={quizData.serviceNeeds}
              onChange={(value) => updateQuizData('serviceNeeds', value)}
            />
          )}
          {currentStep === 1 && (
            <DealSizeStep
              selected={quizData.dealSizeRange}
              onChange={(value) => updateQuizData('dealSizeRange', value)}
            />
          )}
          {currentStep === 2 && (
            <LocationStep
              selected={quizData.locationPreference}
              onChange={(value) => updateQuizData('locationPreference', value)}
            />
          )}
          {currentStep === 3 && (
            <TimelineStep
              selected={quizData.timeline}
              onChange={(value) => updateQuizData('timeline', value)}
            />
          )}
          {currentStep === 4 && (
            <ContactStep
              data={quizData}
              onChange={updateQuizData}
            />
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get My Matches
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
