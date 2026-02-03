import Link from 'next/link'
import { Plus, BadgeCheck, Star, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import type { Provider } from '@/types/database'

async function getProviders(): Promise<Provider[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching providers:', error)
    return []
  }

  return data as Provider[]
}

export default async function AdminProvidersPage() {
  const providers = await getProviders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Providers</h1>
          <p className="text-muted-foreground">
            Manage service providers in the directory
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/providers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Link>
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No providers yet</p>
          <Button asChild>
            <Link href="/admin/providers/new">Add your first provider</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.name}</span>
                      {provider.is_verified && (
                        <BadgeCheck className="h-4 w-4 text-primary" />
                      )}
                      {provider.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{provider.company_name || '-'}</TableCell>
                  <TableCell>
                    {provider.city && provider.state
                      ? `${provider.city}, ${provider.state}`
                      : provider.state || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/providers/${provider.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
