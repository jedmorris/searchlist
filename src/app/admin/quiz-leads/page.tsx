'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Users, Mail, Phone, Building, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { QuizLead } from '@/types/database'

export default function AdminQuizLeadsPage() {
  const [leads, setLeads] = useState<QuizLead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/quiz-leads')
      const data = await res.json()
      setLeads(data.leads || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching quiz leads:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Quiz Leads</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Leads</h1>
          <p className="text-muted-foreground">
            Leads generated from the provider matching quiz
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          {total} Total Leads
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quiz leads yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Submissions</CardTitle>
            <CardDescription>Click on a row to view full details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Services Needed</TableHead>
                  <TableHead>Deal Size</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lead.service_needs.slice(0, 2).map((service) => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {lead.service_needs.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lead.service_needs.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.deal_size_range || '-'}</TableCell>
                    <TableCell>{lead.location_preference || '-'}</TableCell>
                    <TableCell>{lead.matched_provider_ids.length}</TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Lead Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedLead && new Date(selectedLead.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Name
                  </span>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </span>
                  <p className="font-medium">
                    <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                      {selectedLead.email}
                    </a>
                  </p>
                </div>
                {selectedLead.phone && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </span>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.company_name && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" /> Company
                    </span>
                    <p className="font-medium">{selectedLead.company_name}</p>
                  </div>
                )}
              </div>

              {/* Quiz Responses */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Quiz Responses</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Services Needed</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLead.service_needs.map((service) => (
                        <Badge key={service} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Deal Size</span>
                    <p className="font-medium">{selectedLead.deal_size_range || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location Preference</span>
                    <p className="font-medium">{selectedLead.location_preference || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Timeline</span>
                    <p className="font-medium">{selectedLead.timeline || 'Not specified'}</p>
                  </div>
                </div>
                {selectedLead.additional_notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Additional Notes</span>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedLead.additional_notes}</p>
                  </div>
                )}
              </div>

              {/* Matched Providers */}
              {selectedLead.matched_provider_ids.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-semibold">
                    Matched Providers ({selectedLead.matched_provider_ids.length})
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(selectedLead.match_scores).map(([id, score]) => (
                      <div key={id} className="flex items-center justify-between py-1">
                        <span className="font-mono text-xs">{id.slice(0, 8)}...</span>
                        <Badge variant="outline">{score}% match</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button asChild>
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
