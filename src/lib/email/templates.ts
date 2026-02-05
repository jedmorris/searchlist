import { EMAIL_CONFIG } from './client'

// Base email layout wrapper
function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0 15px;" />
      <p style="color: #666; font-size: 12px; text-align: center;">
        <a href="${EMAIL_CONFIG.siteUrl}" style="color: #666;">${EMAIL_CONFIG.siteName}</a> -
        Find trusted service providers for your business acquisition journey.
      </p>
    </body>
    </html>
  `
}

// Button component
function button(text: string, url: string): string {
  return `
    <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 0;">
      ${text}
    </a>
  `
}

// Info box component
function infoBox(content: string): string {
  return `
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
      ${content}
    </div>
  `
}

// ============================================
// INQUIRY NOTIFICATION TEMPLATES
// ============================================

export interface InquiryEmailData {
  providerName: string
  providerEmail: string
  senderName: string
  senderEmail: string
  senderPhone?: string | null
  companyName?: string | null
  dealContext?: string | null
  message: string
}

export function inquiryNotificationEmail(data: InquiryEmailData): { subject: string; html: string } {
  const dealContextMap: Record<string, string> = {
    buying: 'Buying a business',
    selling: 'Selling a business',
    both: 'Both buying and selling',
    general: 'General inquiry',
  }
  const dealContextLabel = data.dealContext
    ? dealContextMap[data.dealContext] || data.dealContext
    : 'Not specified'

  const html = baseLayout(`
    <h2 style="color: #1e293b; margin-bottom: 8px;">New Inquiry Received</h2>
    <p style="color: #64748b; margin-top: 0;">Hi ${data.providerName.split(' ')[0]}, you have a new inquiry through ${EMAIL_CONFIG.siteName}.</p>

    ${infoBox(`
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${data.senderName}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> <a href="mailto:${data.senderEmail}" style="color: #2563eb;">${data.senderEmail}</a></p>
      ${data.senderPhone ? `<p style="margin: 0 0 8px;"><strong>Phone:</strong> ${data.senderPhone}</p>` : ''}
      ${data.companyName ? `<p style="margin: 0 0 8px;"><strong>Company:</strong> ${data.companyName}</p>` : ''}
      <p style="margin: 0 0 8px;"><strong>Context:</strong> ${dealContextLabel}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
      <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
    `)}

    <p>You can reply directly to this email to respond to ${data.senderName}.</p>

    ${button('View in Portal', `${EMAIL_CONFIG.siteUrl}/portal/inquiries`)}
  `)

  return {
    subject: `New Inquiry from ${data.senderName} via ${EMAIL_CONFIG.siteName}`,
    html,
  }
}

// ============================================
// INVITATION EMAIL TEMPLATES
// ============================================

export interface InvitationEmailData {
  email: string
  providerName?: string | null
  inviteUrl: string
  expiresAt: string
}

export function invitationEmail(data: InvitationEmailData): { subject: string; html: string } {
  const html = baseLayout(`
    <h2 style="color: #1e293b; margin-bottom: 8px;">You're Invited to ${EMAIL_CONFIG.siteName}</h2>
    <p style="color: #64748b; margin-top: 0;">
      ${data.providerName
        ? `You've been invited to claim your provider profile for <strong>${data.providerName}</strong> on ${EMAIL_CONFIG.siteName}.`
        : `You've been invited to join ${EMAIL_CONFIG.siteName} as a service provider.`
      }
    </p>

    <p>${EMAIL_CONFIG.siteName} connects business acquisition professionals with entrepreneurs looking for trusted service providers. As a listed provider, you'll:</p>

    <ul style="color: #475569;">
      <li>Receive inquiries from potential clients</li>
      <li>Showcase your expertise and experience</li>
      <li>Build your reputation with reviews</li>
      <li>Access your dedicated provider portal</li>
    </ul>

    ${button('Accept Invitation', data.inviteUrl)}

    <p style="color: #64748b; font-size: 14px;">
      This invitation expires on ${new Date(data.expiresAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}.
    </p>

    <p style="color: #64748b; font-size: 14px;">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  `)

  return {
    subject: data.providerName
      ? `Claim your ${data.providerName} profile on ${EMAIL_CONFIG.siteName}`
      : `You're invited to join ${EMAIL_CONFIG.siteName}`,
    html,
  }
}

// ============================================
// REVIEW NOTIFICATION TEMPLATES
// ============================================

export interface ReviewNotificationData {
  providerName: string
  providerEmail: string
  providerSlug: string
  reviewerName: string
  rating: number
  title?: string | null
  content: string
}

export function newReviewNotificationEmail(data: ReviewNotificationData): { subject: string; html: string } {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)

  const html = baseLayout(`
    <h2 style="color: #1e293b; margin-bottom: 8px;">New Review Received</h2>
    <p style="color: #64748b; margin-top: 0;">Hi ${data.providerName.split(' ')[0]}, you've received a new review on ${EMAIL_CONFIG.siteName}!</p>

    ${infoBox(`
      <p style="margin: 0 0 8px; font-size: 24px; color: #f59e0b;">${stars}</p>
      <p style="margin: 0 0 8px;"><strong>Rating:</strong> ${data.rating}/5</p>
      <p style="margin: 0 0 8px;"><strong>From:</strong> ${data.reviewerName}</p>
      ${data.title ? `<p style="margin: 0 0 8px;"><strong>Title:</strong> ${data.title}</p>` : ''}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
      <p style="margin: 0; white-space: pre-wrap;">"${data.content}"</p>
    `)}

    <p style="color: #64748b;">This review is pending moderation and will appear on your profile once approved.</p>

    ${button('View Your Profile', `${EMAIL_CONFIG.siteUrl}/provider/${data.providerSlug}`)}
  `)

  return {
    subject: `New ${data.rating}-star review from ${data.reviewerName}`,
    html,
  }
}

export function reviewApprovedEmail(data: ReviewNotificationData): { subject: string; html: string } {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)

  const html = baseLayout(`
    <h2 style="color: #1e293b; margin-bottom: 8px;">Your Review Has Been Approved</h2>
    <p style="color: #64748b; margin-top: 0;">Great news! Your ${data.rating}-star review is now live on ${EMAIL_CONFIG.siteName}.</p>

    ${infoBox(`
      <p style="margin: 0 0 8px; font-size: 24px; color: #f59e0b;">${stars}</p>
      ${data.title ? `<p style="margin: 0 0 8px;"><strong>${data.title}</strong></p>` : ''}
      <p style="margin: 0; white-space: pre-wrap;">"${data.content}"</p>
    `)}

    ${button('View on Profile', `${EMAIL_CONFIG.siteUrl}/provider/${data.providerSlug}`)}

    <p style="color: #64748b; font-size: 14px;">Thank you for sharing your experience!</p>
  `)

  return {
    subject: `Your review has been published on ${EMAIL_CONFIG.siteName}`,
    html,
  }
}

// ============================================
// ADMIN NOTIFICATION TEMPLATES
// ============================================

export interface AdminNotificationData {
  type: 'inquiry' | 'review' | 'quiz_lead'
  summary: string
  details: Record<string, string>
}

export function adminNotificationEmail(data: AdminNotificationData): { subject: string; html: string } {
  const typeLabels = {
    inquiry: 'New Inquiry',
    review: 'New Review (Pending)',
    quiz_lead: 'New Quiz Lead',
  }

  const detailsList = Object.entries(data.details)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('')

  const html = baseLayout(`
    <h2 style="color: #1e293b; margin-bottom: 8px;">[Admin] ${typeLabels[data.type]}</h2>
    <p style="color: #64748b; margin-top: 0;">${data.summary}</p>

    ${infoBox(`<ul style="margin: 0; padding-left: 20px;">${detailsList}</ul>`)}

    ${button('View in Admin Panel', `${EMAIL_CONFIG.siteUrl}/admin`)}
  `)

  return {
    subject: `[${EMAIL_CONFIG.siteName}] ${typeLabels[data.type]}`,
    html,
  }
}
