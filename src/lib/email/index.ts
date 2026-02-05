// Email client and configuration
export { resend, EMAIL_CONFIG, isEmailConfigured } from './client'

// Email sending functions
export {
  sendInquiryNotification,
  sendInquiryAdminNotification,
  sendInvitationEmail,
  sendNewReviewNotification,
  sendReviewApprovedNotification,
  sendReviewAdminNotification,
  sendQuizLeadAdminNotification,
} from './send'

// Types
export type { InquiryEmailData, InvitationEmailData, ReviewNotificationData } from './templates'
export type { QuizLeadEmailData } from './send'
