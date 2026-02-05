import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Search List - the directory for ETA service providers.',
}

const faqSections = [
  {
    title: 'For Buyers & Searchers',
    icon: '🔍',
    questions: [
      {
        q: 'What is Search List?',
        a: 'Search List is a directory of vetted service providers who specialize in helping entrepreneurs acquire and operate small businesses through Entrepreneurship Through Acquisition (ETA). We connect searchers and buyers with lawyers, accountants, lenders, advisors, and other professionals who understand the unique needs of business acquisitions.',
      },
      {
        q: 'Is it free to use Search List?',
        a: 'Yes! Browsing providers, reading reviews, and sending inquiries is completely free for buyers and searchers. We believe in making it easy for you to find the right professionals for your acquisition journey.',
      },
      {
        q: 'How do I find the right provider for my needs?',
        a: 'You can browse by category, use our search with filters (location, deal size, industry, ratings), or take our matching quiz which asks about your specific needs and recommends providers based on your criteria. Each provider profile includes their specialties, experience, reviews, and contact information.',
      },
      {
        q: 'What does "Verified" mean on a provider profile?',
        a: 'Verified providers have been reviewed by our team to confirm their identity and professional credentials. This badge indicates an additional level of trust, though we encourage you to do your own due diligence when selecting any service provider.',
      },
      {
        q: 'How do reviews work?',
        a: 'Reviews are submitted by clients who have worked with providers. All reviews go through a moderation process before being published to ensure they are authentic and helpful. Providers cannot remove negative reviews, but they may respond to them publicly.',
      },
      {
        q: 'What happens when I send an inquiry?',
        a: 'When you submit an inquiry through a provider\'s profile, they receive an email notification with your message and contact information. Most providers respond within 1-2 business days. Your information is only shared with the specific provider you contact.',
      },
    ],
  },
  {
    title: 'For Service Providers',
    icon: '💼',
    questions: [
      {
        q: 'How do I get listed on Search List?',
        a: 'Providers are added to Search List through our invitation system. If you\'re a service provider specializing in ETA or business acquisitions, contact us to request an invitation. Once invited, you can create your profile and start receiving inquiries.',
      },
      {
        q: 'What does a listing cost?',
        a: 'We offer multiple tiers: a free basic listing, and premium tiers with enhanced visibility, featured placement, and additional features. Visit your provider portal to see current pricing and upgrade options.',
      },
      {
        q: 'How do I manage my profile?',
        a: 'Once you\'ve accepted your invitation and created an account, you can access your Provider Portal to update your profile, view inquiries, manage your subscription, and see your performance metrics.',
      },
      {
        q: 'Can I respond to reviews?',
        a: 'Yes, we encourage providers to engage with their reviews. You can respond publicly to any review on your profile, which helps build trust with potential clients.',
      },
      {
        q: 'How do Featured and Verified badges work?',
        a: 'The Verified badge is earned by completing our verification process. Featured status is available to premium subscribers and gives you priority placement in search results and category listings.',
      },
      {
        q: 'What information do I receive about inquiries?',
        a: 'You\'ll receive the inquirer\'s name, email, phone (if provided), company name, their message, and any deal context they\'ve shared. You can manage and track all inquiries through your Provider Portal.',
      },
    ],
  },
  {
    title: 'About ETA & Business Acquisitions',
    icon: '📚',
    questions: [
      {
        q: 'What is Entrepreneurship Through Acquisition (ETA)?',
        a: 'ETA is a path to business ownership where an entrepreneur acquires an existing company rather than starting one from scratch. This approach allows you to take over a business with established customers, revenue, and operations, reducing some of the risks associated with startups.',
      },
      {
        q: 'What types of professionals do I need for an acquisition?',
        a: 'A typical acquisition team includes: an M&A attorney for legal documents, a CPA or accountant for financial due diligence, a lender or financing source, potentially a business broker, and advisors with acquisition experience. The specific team depends on your deal size and complexity.',
      },
      {
        q: 'What deal sizes does Search List cover?',
        a: 'Our providers work across a range of deal sizes, from small business acquisitions under $500K to lower middle market deals of $10M+. You can filter providers by their deal size range to find professionals experienced with transactions similar to yours.',
      },
      {
        q: 'Do providers work with self-funded searchers?',
        a: 'Yes! Many of our providers specialize in working with self-funded searchers and understand the unique dynamics of independent acquisitions. You can filter for providers who work with your deal size range.',
      },
    ],
  },
  {
    title: 'Account & Technical',
    icon: '⚙️',
    questions: [
      {
        q: 'Do I need an account to browse providers?',
        a: 'No, you can browse all providers, read reviews, and view profiles without creating an account. You only need to provide your contact information when you\'re ready to send an inquiry to a specific provider.',
      },
      {
        q: 'How is my information protected?',
        a: 'We take privacy seriously. Your contact information is only shared with providers you explicitly contact. We use industry-standard encryption and security practices to protect your data. See our Privacy Policy for full details.',
      },
      {
        q: 'I\'m having technical issues. How do I get help?',
        a: 'For technical support, please email support@searchlist.com with a description of the issue you\'re experiencing. Include any error messages and the device/browser you\'re using.',
      },
      {
        q: 'How do I report an issue with a provider or review?',
        a: 'If you believe a provider listing or review violates our guidelines, please contact us at support@searchlist.com with details. We review all reports and take appropriate action.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">FAQ</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions about Search List, our providers, and the ETA process.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto space-y-8">
        {faqSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
            </p>
            <Link
              href="mailto:support@searchlist.com"
              className="text-primary hover:underline font-medium"
            >
              Contact Support →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
