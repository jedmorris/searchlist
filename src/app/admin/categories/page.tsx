'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DynamicIcon } from '@/components/shared/Icons'
import { useToast } from '@/hooks/use-toast'
import type { Category } from '@/types/database'

// Common Lucide icon names for categories
const ICON_OPTIONS = [
  'Scale', 'FileSearch', 'Calculator', 'Landmark', 'Handshake',
  'Shield', 'PiggyBank', 'Users', 'Briefcase', 'Building',
  'DollarSign', 'TrendingUp', 'FileText', 'Gavel', 'BarChart',
]

interface CategoryWithCounts extends Category {
  providerCount?: number
  serviceCount?: number
}

export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryWithCounts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithCounts | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Briefcase',
    display_order: 0,
  })

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()

      // Fetch counts
      const [providerCountsRes, serviceCountsRes] = await Promise.all([
        fetch('/api/categories/counts?type=providers'),
        fetch('/api/categories/counts?type=services'),
      ])

      // If counts endpoints don't exist yet, that's okay
      let providerCounts: Record<string, number> = {}
      let serviceCounts: Record<string, number> = {}

      try {
        providerCounts = await providerCountsRes.json()
      } catch {
        // Counts not available
      }
      try {
        serviceCounts = await serviceCountsRes.json()
      } catch {
        // Counts not available
      }

      const categoriesWithCounts = data.map((cat: Category) => ({
        ...cat,
        providerCount: providerCounts[cat.id] || 0,
        serviceCount: serviceCounts[cat.id] || 0,
      }))

      setCategories(categoriesWithCounts)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreateDialog() {
    setSelectedCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Briefcase',
      display_order: categories.length,
    })
    setEditDialogOpen(true)
  }

  function openEditDialog(category: CategoryWithCounts) {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'Briefcase',
      display_order: category.display_order,
    })
    setEditDialogOpen(true)
  }

  function openDeleteDialog(category: CategoryWithCounts) {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, name, slug })
  }

  async function handleSave() {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Error',
        description: 'Name and slug are required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const url = selectedCategory
        ? `/api/categories/${selectedCategory.id}`
        : '/api/categories'
      const method = selectedCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category')
      }

      toast({
        title: selectedCategory ? 'Category updated' : 'Category created',
        description: `${formData.name} has been ${selectedCategory ? 'updated' : 'added'}.`,
      })

      setEditDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedCategory) return

    setIsSaving(true)

    try {
      const res = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category')
      }

      toast({
        title: 'Category deleted',
        description: `${selectedCategory.name} has been removed.`,
      })

      setDeleteDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage service categories in the directory
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
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
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No categories yet. Create your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
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
                      {category.providerCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {category.serviceCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      {category.display_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Update the category details below.'
                : 'Add a new service category to the directory.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Legal / M&A Attorneys"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="legal"
              />
              <p className="text-xs text-muted-foreground">
                Will appear as: /{formData.slug || 'slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deal counsel, M&A attorneys, and legal advisors"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={`p-2 rounded-md border transition-colors ${
                      formData.icon === iconName
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <DynamicIcon name={iconName} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : selectedCategory ? (
                'Update Category'
              ) : (
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;?
              {(selectedCategory?.providerCount || 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This category has {selectedCategory?.providerCount} provider(s).
                  You must remove them first.
                </span>
              )}
              {(selectedCategory?.serviceCount || 0) > 0 && (
                <span className="block mt-2">
                  This will also delete {selectedCategory?.serviceCount} associated service(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving || (selectedCategory?.providerCount || 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
