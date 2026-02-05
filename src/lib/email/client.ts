import { Resend } from 'resend'

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Search List <noreply@searchlist.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@searchlist.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName: 'Search List',
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  return resend !== null
}
