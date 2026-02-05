import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/PortalNav'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login?redirect=/portal')
  }

  // Get user profile with provider info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('user_profiles') as any)
    .select('*, providers(name)')
    .eq('id', user.id)
    .single()

  const providerName = profile?.providers?.name as string | undefined

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <PortalNav userEmail={user.email || ''} providerName={providerName} />
      <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">{children}</main>
    </div>
  )
}
