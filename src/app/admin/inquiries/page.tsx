import Link from 'next/link'
import { ChevronRight, Mail, MailOpen, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { MarkAsReadButton } from './MarkAsReadButton'
import type { Inquiry, Provider } from '@/types/database'

type InquiryWithProvider = Inquiry & {
  providers: Pick<Provider, 'id' | 'name' | 'slug'> | null
}

async function getInquiries(): Promise<InquiryWithProvider[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inquiries')
    .select('*, providers(id, name, slug)')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return data as InquiryWithProvider[]
}

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries()

  const unreadCount = inquiries.filter((i) => !i.is_read).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Inquiries</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inquiries</h1>
          <p className="text-muted-foreground">
            {inquiries.length} total, {unreadCount} unread
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
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
                        {!inquiry.is_read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.sender_email}
                        {inquiry.sender_phone && ` | ${inquiry.sender_phone}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">To:</span>
                  <Link
                    href={`/provider/${inquiry.providers?.slug || ''}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {inquiry.providers?.name || 'Unknown'}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

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

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${inquiry.sender_email}`}>
                      Reply via Email
                    </a>
                  </Button>

                  {!inquiry.is_read && (
                    <MarkAsReadButton inquiryId={inquiry.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
