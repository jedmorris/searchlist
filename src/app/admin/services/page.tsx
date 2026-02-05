'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { Category, Service } from '@/types/database'

interface ServiceWithCategory extends Service {
  categories: { name: string; slug: string } | null
  providerCount?: number
}

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<ServiceWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceWithCategory | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
  })

  async function fetchData() {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/categories'),
      ])

      const servicesData = await servicesRes.json()
      const categoriesData = await categoriesRes.json()

      // Get provider counts for services
      const countsRes = await fetch('/api/services/counts')
      let counts: Record<string, number> = {}
      try {
        counts = await countsRes.json()
      } catch {
        // Counts not available yet
      }

      const servicesWithCounts = servicesData.map((service: ServiceWithCategory) => ({
        ...service,
        providerCount: counts[service.id] || 0,
      }))

      setServices(servicesWithCounts)
      setCategories(categoriesData)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreateDialog(categoryId?: string) {
    setSelectedService(null)
    setFormData({
      name: '',
      slug: '',
      category_id: categoryId || (categories[0]?.id || ''),
    })
    setEditDialogOpen(true)
  }

  function openEditDialog(service: ServiceWithCategory) {
    setSelectedService(service)
    setFormData({
      name: service.name,
      slug: service.slug,
      category_id: service.category_id,
    })
    setEditDialogOpen(true)
  }

  function openDeleteDialog(service: ServiceWithCategory) {
    setSelectedService(service)
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
    if (!formData.name || !formData.slug || !formData.category_id) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const url = selectedService
        ? `/api/services/${selectedService.id}`
        : '/api/services'
      const method = selectedService ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save service')
      }

      toast({
        title: selectedService ? 'Service updated' : 'Service created',
        description: `${formData.name} has been ${selectedService ? 'updated' : 'added'}.`,
      })

      setEditDialogOpen(false)
      fetchData()
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
    if (!selectedService) return

    setIsSaving(true)

    try {
      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete service')
      }

      toast({
        title: 'Service deleted',
        description: `${selectedService.name} has been removed.`,
      })

      setDeleteDialogOpen(false)
      fetchData()
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

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category_id
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(service)
    return acc
  }, {} as Record<string, ServiceWithCategory[]>)

  // Filter services
  const filteredServices = filterCategory === 'all'
    ? services
    : services.filter(s => s.category_id === filterCategory)

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
        <span className="text-foreground">Services</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="h-8 w-8" />
            Services
          </h1>
          <p className="text-muted-foreground">
            Manage services offered within each category
          </p>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(servicesByCategory).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Category:</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filterCategory !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setFilterCategory('all')}>
            Clear
          </Button>
        )}
      </div>

      {/* Services Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Providers</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {filterCategory === 'all'
                    ? 'No services yet. Create your first service to get started.'
                    : 'No services in this category.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {service.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {service.categories?.name || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {service.providerCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(service)}
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
              {selectedService ? 'Edit Service' : 'Create Service'}
            </DialogTitle>
            <DialogDescription>
              {selectedService
                ? 'Update the service details below.'
                : 'Add a new service to a category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="M&A Transaction Counsel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ma-counsel"
              />
              <p className="text-xs text-muted-foreground">
                Used for filtering. Must be unique within the category.
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
              ) : selectedService ? (
                'Update Service'
              ) : (
                'Create Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedService?.name}&quot;?
              {(selectedService?.providerCount || 0) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This service is used by {selectedService?.providerCount} provider(s).
                  You must remove it from providers first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving || (selectedService?.providerCount || 0) > 0}
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
