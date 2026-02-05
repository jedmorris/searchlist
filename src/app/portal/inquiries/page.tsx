import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Mail, MailOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Inquiry } from '@/types/database'

async function getProviderInquiries(providerId: string): Promise<Inquiry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return data as Inquiry[]
}

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  new: { label: 'New', variant: 'default' },
  contacted: { label: 'Contacted', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'outline' },
  converted: { label: 'Converted', variant: 'default' },
}

export default async function PortalInquiriesPage() {
  const profile = await getUserProfile()

  if (!profile?.provider_id) {
    redirect('/portal')
  }

  const inquiries = await getProviderInquiries(profile.provider_id)
  const unreadCount = inquiries.filter((i) => !i.is_read).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/portal" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Inquiries</span>
      </nav>

      <div>
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground">
          {inquiries.length} total, {unreadCount} unread
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No inquiries yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            When potential clients contact you through your profile, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const status = inquiry.status || 'new'
            const badgeInfo = STATUS_BADGES[status] || STATUS_BADGES.new

            return (
              <Card
                key={inquiry.id}
                className={inquiry.is_read ? 'opacity-75' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {inquiry.is_read ? (
                        <MailOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Mail className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {inquiry.sender_name}
                          <Badge variant={badgeInfo.variant} className="text-xs">
                            {badgeInfo.label}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {inquiry.sender_email}
                          {inquiry.sender_phone && ` | ${inquiry.sender_phone}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inquiry.company_name && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Company:</span>{' '}
                      {inquiry.company_name}
                    </div>
                  )}

                  {inquiry.deal_context && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Context:</span>{' '}
                      <Badge variant="outline">{inquiry.deal_context}</Badge>
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                  </div>

                  <div className="flex items-center pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${inquiry.sender_email}`}>
                        Reply via Email
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
