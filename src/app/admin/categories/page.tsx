import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DynamicIcon } from '@/components/shared/Icons'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types/database'

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  if (error || !data) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data as Category[]
}

async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_categories')
    .select('category_id')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  data.forEach((item: { category_id: string }) => {
    counts[item.category_id] = (counts[item.category_id] || 0) + 1
  })

  return counts
}

async function getServiceCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('category_id')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  data.forEach((item: { category_id: string }) => {
    counts[item.category_id] = (counts[item.category_id] || 0) + 1
  })

  return counts
}

export default async function AdminCategoriesPage() {
  const [categories, providerCounts, serviceCounts] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    getServiceCounts(),
  ])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Categories</span>
      </nav>

      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          View service categories in the directory
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Providers</TableHead>
              <TableHead className="text-center">Services</TableHead>
              <TableHead className="text-center">Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="p-2 rounded-md bg-primary/10 w-fit">
                    <DynamicIcon
                      name={category.icon}
                      className="h-4 w-4 text-primary"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    /{category.slug}
                  </code>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {providerCounts[category.id] || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {serviceCounts[category.id] || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {category.display_order}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: Category management (add, edit, delete) can be done directly in the
        Supabase dashboard or through SQL migrations for now.
      </p>
    </div>
  )
}
