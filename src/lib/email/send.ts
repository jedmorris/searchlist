import { resend, EMAIL_CONFIG, isEmailConfigured } from './client'
import {
  inquiryNotificationEmail,
  invitationEmail,
  newReviewNotificationEmail,
  reviewApprovedEmail,
  adminNotificationEmail,
  type InquiryEmailData,
  type InvitationEmailData,
  type ReviewNotificationData,
} from './templates'

interface SendEmailResult {
  success: boolean
  error?: string
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<SendEmailResult> {
  if (!isEmailConfigured() || !resend) {
    console.log(`[Email] Skipped (not configured): ${subject} -> ${to}`)
    return { success: false, error: 'Email not configured' }
  }

  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    })
    console.log(`[Email] Sent: ${subject} -> ${to}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Email] Failed: ${subject} -> ${to}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// ============================================
// INQUIRY EMAILS
// ============================================

export async function sendInquiryNotification(data: InquiryEmailData): Promise<SendEmailResult> {
  const { subject, html } = inquiryNotificationEmail(data)
  return sendEmail(data.providerEmail, subject, html, data.senderEmail)
}

export async function sendInquiryAdminNotification(data: InquiryEmailData): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return { success: false, error: 'Admin email not configured' }
  }

  const { subject, html } = adminNotificationEmail({
    type: 'inquiry',
    summary: `New inquiry for ${data.providerName}`,
    details: {
      Provider: data.providerName,
      From: `${data.senderName} (${data.senderEmail})`,
      Context: data.dealContext || 'Not specified',
      'Message Preview': data.message.substring(0, 150) + (data.message.length > 150 ? '...' : ''),
    },
  })

  return sendEmail(adminEmail, subject, html)
}

// ============================================
// INVITATION EMAILS
// ============================================

export async function sendInvitationEmail(data: InvitationEmailData): Promise<SendEmailResult> {
  const { subject, html } = invitationEmail(data)
  return sendEmail(data.email, subject, html)
}

// ============================================
// REVIEW EMAILS
// ============================================

export async function sendNewReviewNotification(data: ReviewNotificationData): Promise<SendEmailResult> {
  const { subject, html } = newReviewNotificationEmail(data)
  return sendEmail(data.providerEmail, subject, html)
}

export async function sendReviewApprovedNotification(
  reviewerEmail: string,
  data: Omit<ReviewNotificationData, 'providerEmail'>
): Promise<SendEmailResult> {
  const { subject, html } = reviewApprovedEmail({ ...data, providerEmail: reviewerEmail })
  return sendEmail(reviewerEmail, subject, html)
}

export async function sendReviewAdminNotification(data: ReviewNotificationData): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return { success: false, error: 'Admin email not configured' }
  }

  const { subject, html } = adminNotificationEmail({
    type: 'review',
    summary: `New ${data.rating}-star review pending moderation`,
    details: {
      Provider: data.providerName,
      Reviewer: data.reviewerName,
      Rating: `${data.rating}/5`,
      Title: data.title || 'No title',
      'Review Preview': data.content.substring(0, 150) + (data.content.length > 150 ? '...' : ''),
    },
  })

  return sendEmail(adminEmail, subject, html)
}

// ============================================
// QUIZ LEAD EMAILS
// ============================================

export interface QuizLeadEmailData {
  name: string
  email: string
  phone?: string | null
  companyName?: string | null
  serviceNeeds: string[]
  dealSizeRange?: string | null
  locationPreference?: string | null
  matchedCount: number
}

export async function sendQuizLeadAdminNotification(data: QuizLeadEmailData): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return { success: false, error: 'Admin email not configured' }
  }

  const { subject, html } = adminNotificationEmail({
    type: 'quiz_lead',
    summary: `New quiz submission from ${data.name}`,
    details: {
      Name: data.name,
      Email: data.email,
      Phone: data.phone || 'Not provided',
      Company: data.companyName || 'Not provided',
      'Services Needed': data.serviceNeeds.join(', '),
      'Deal Size': data.dealSizeRange || 'Not specified',
      Location: data.locationPreference || 'Not specified',
      'Matched Providers': String(data.matchedCount),
    },
  })

  return sendEmail(adminEmail, subject, html)
}
