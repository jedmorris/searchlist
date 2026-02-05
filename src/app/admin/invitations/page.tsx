'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Mail, Plus, Trash2, Copy, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface Invitation {
  id: string
  email: string
  provider_id: string | null
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
  providers?: { id: string; name: string; slug: string } | null
}

export default function AdminInvitationsPage() {
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newInviteUrl, setNewInviteUrl] = useState('')

  useEffect(() => {
    fetchInvitations()
  }, [])

  async function fetchInvitations() {
    try {
      const res = await fetch('/api/admin/invitations')
      const data = await res.json()
      setInvitations(data.invitations || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createInvitation() {
    if (!newEmail) return

    setCreating(true)
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invitation')
      }

      setNewInviteUrl(data.invite_url)
      toast({
        title: 'Invitation created',
        description: 'Copy the invite link to share with the provider.',
      })
      fetchInvitations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create invitation',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  async function deleteInvitation(id: string) {
    try {
      const res = await fetch(`/api/admin/invitations/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete invitation')
      }

      toast({
        title: 'Invitation deleted',
      })
      fetchInvitations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete invitation',
        variant: 'destructive',
      })
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copied to clipboard',
    })
  }

  function getInviteUrl(token: string) {
    return `${window.location.origin}/auth/accept-invitation?token=${token}`
  }

  function getStatus(invitation: Invitation) {
    if (invitation.accepted_at) {
      return { label: 'Accepted', variant: 'default' as const, icon: CheckCircle }
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'destructive' as const, icon: XCircle }
    }
    return { label: 'Pending', variant: 'secondary' as const, icon: Clock }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Invitations</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Invitations</h1>
          <p className="text-muted-foreground">
            Invite providers to manage their own profiles
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) {
            setNewEmail('')
            setNewInviteUrl('')
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Provider</DialogTitle>
              <DialogDescription>
                Send an invitation to a provider to create their account and manage their profile.
              </DialogDescription>
            </DialogHeader>
            {newInviteUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Invitation created successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    Share this link with the provider:
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input value={newInviteUrl} readOnly className="font-mono text-xs" />
                  <Button size="icon" variant="outline" onClick={() => copyToClipboard(newInviteUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setShowDialog(false)
                    setNewEmail('')
                    setNewInviteUrl('')
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="provider@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createInvitation} disabled={creating || !newEmail}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : invitations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invitations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click &quot;Invite Provider&quot; to send your first invitation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const status = getStatus(invitation)
                  const StatusIcon = status.icon

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        {invitation.providers ? (
                          <Link
                            href={`/provider/${invitation.providers.slug}`}
                            className="text-primary hover:underline"
                          >
                            {invitation.providers.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!invitation.accepted_at && new Date(invitation.expires_at) > new Date() && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => copyToClipboard(getInviteUrl(invitation.token))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteInvitation(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
