'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuizData } from '../QuizWizard'

interface ContactStepProps {
  data: QuizData
  onChange: <K extends keyof QuizData>(key: K, value: QuizData[K]) => void
}

export function ContactStep({ data, onChange }: ContactStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enter your contact information to see your personalized matches.
        Providers may reach out to you directly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="John Smith"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name (optional)</Label>
          <Input
            id="companyName"
            placeholder="Acme Corp"
            value={data.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">
          Additional Notes (optional)
        </Label>
        <Textarea
          id="additionalNotes"
          placeholder="Tell us more about your specific needs, industry focus, or any other details that would help us match you with the right providers..."
          value={data.additionalNotes}
          onChange={(e) => onChange('additionalNotes', e.target.value)}
          rows={4}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        By submitting, you agree to be contacted by matched service providers.
        Your information will not be shared with anyone else.
      </p>
    </div>
  )
}
