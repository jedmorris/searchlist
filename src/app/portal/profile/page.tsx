import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { ProfileEditForm } from '@/components/portal/ProfileEditForm'
import type { Provider, Category, Service } from '@/types/database'

async function getProviderData(providerId: string) {
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('name')

  const { data: providerCategories } = await supabase
    .from('provider_categories')
    .select('category_id')
    .eq('provider_id', providerId)

  const { data: providerServices } = await supabase
    .from('provider_services')
    .select('service_id')
    .eq('provider_id', providerId)

  return {
    provider: provider as Provider | null,
    categories: (categories || []) as Category[],
    services: (services || []) as Service[],
    providerCategories: (providerCategories || []).map((pc: { category_id: string }) => pc.category_id),
    providerServices: (providerServices || []).map((ps: { service_id: string }) => ps.service_id),
  }
}

export default async function PortalProfilePage() {
  const profile = await getUserProfile()

  if (!profile?.provider_id) {
    redirect('/portal')
  }

  const data = await getProviderData(profile.provider_id)

  if (!data.provider) {
    redirect('/portal')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/portal" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Edit Profile</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your public profile information
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/provider/${data.provider.slug}`} target="_blank">
            View Public Profile
            <ExternalLink className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <ProfileEditForm
        provider={data.provider}
        categories={data.categories}
        services={data.services}
        providerCategories={data.providerCategories}
        providerServices={data.providerServices}
      />
    </div>
  )
}
