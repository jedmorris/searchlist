import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProviderForm } from '@/components/forms/ProviderForm'
import { createClient } from '@/lib/supabase/server'
import type { Provider, Category, Service } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProvider(id: string): Promise<Provider | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .single()
  return data as Provider | null
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  return (data || []) as Category[]
}

async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('name')
  return (data || []) as Service[]
}

async function getProviderCategories(providerId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('provider_categories')
    .select('category_id')
    .eq('provider_id', providerId)
  return data?.map((d: { category_id: string }) => d.category_id) || []
}

async function getProviderServices(providerId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('provider_services')
    .select('service_id')
    .eq('provider_id', providerId)
  return data?.map((d: { service_id: string }) => d.service_id) || []
}

export default async function EditProviderPage({ params }: PageProps) {
  const { id } = await params

  const [provider, categories, services, providerCategories, providerServices] =
    await Promise.all([
      getProvider(id),
      getCategories(),
      getServices(),
      getProviderCategories(id),
      getProviderServices(id),
    ])

  if (!provider) {
    notFound()
  }

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
        <span className="text-foreground truncate">{provider.name}</span>
      </nav>

      <div>
        <h1 className="text-3xl font-bold">Edit Provider</h1>
        <p className="text-muted-foreground">Update {provider.name}&apos;s profile</p>
      </div>

      <ProviderForm
        provider={provider}
        categories={categories}
        services={services}
        providerCategories={providerCategories}
        providerServices={providerServices}
      />
    </div>
  )
}
