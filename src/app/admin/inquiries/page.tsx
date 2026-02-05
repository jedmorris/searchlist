import Link from 'next/link'
import { ChevronRight, Mail, MailOpen, ExternalLink, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { MarkAsReadButton } from './MarkAsReadButton'
import { StatusSelector } from './StatusSelector'
import { InquiryFilters } from './InquiryFilters'
import type { Inquiry, Provider } from '@/types/database'

type InquiryWithProvider = Inquiry & {
  providers: Pick<Provider, 'id' | 'name' | 'slug'> | null
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

async function getInquiries(statusFilter?: string): Promise<InquiryWithProvider[]> {
  const supabase = await createClient()

  let query = supabase
    .from('inquiries')
    .select('*, providers(id, name, slug)')
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return data as InquiryWithProvider[]
}

async function getStatusCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inquiries')
    .select('status')

  const counts: Record<string, number> = {
    all: 0,
    new: 0,
    contacted: 0,
    closed: 0,
    converted: 0,
  }

  data?.forEach((inquiry: { status: string | null }) => {
    const status = inquiry.status || 'new'
    counts[status] = (counts[status] || 0) + 1
    counts.all++
  })

  return counts
}

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  new: { label: 'New', variant: 'default' },
  contacted: { label: 'Contacted', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'outline' },
  converted: { label: 'Converted', variant: 'default' },
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status

  const [inquiries, statusCounts] = await Promise.all([
    getInquiries(statusFilter),
    getStatusCounts(),
  ])

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
            {statusCounts.all} total, {unreadCount} unread
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/export/inquiries" download>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </a>
        </Button>
      </div>

      {/* Status Filters */}
      <InquiryFilters currentStatus={statusFilter} counts={statusCounts} />

      {inquiries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {statusFilter ? `No ${statusFilter} inquiries` : 'No inquiries yet'}
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
                    <div className="text-right space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                      <StatusSelector
                        inquiryId={inquiry.id}
                        currentStatus={status}
                      />
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
            )
          })}
        </div>
      )}
    </div>
  )
}
