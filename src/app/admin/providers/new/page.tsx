import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProviderForm } from '@/components/forms/ProviderForm'
import { createClient } from '@/lib/supabase/server'

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return data || []
}

async function getServices() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('name')
  return data || []
}

export default async function NewProviderPage() {
  const [categories, services] = await Promise.all([
    getCategories(),
    getServices(),
  ])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin/providers" className="hover:text-primary">
          Providers
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Provider</span>
      </nav>

      <div>
        <h1 className="text-3xl font-bold">Add New Provider</h1>
        <p className="text-muted-foreground">
          Add a new service provider to the directory
        </p>
      </div>

      <ProviderForm categories={categories} services={services} />
    </div>
  )
}
