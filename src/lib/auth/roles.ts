import { createClient } from '@/lib/supabase/server'
import type { UserRole, UserProfile } from '@/types/database'

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as UserProfile | null
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile()
  return profile?.role ?? null
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isProvider(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'provider' || role === 'admin'
}

export async function getProviderIdForUser(): Promise<string | null> {
  const profile = await getUserProfile()
  return profile?.provider_id ?? null
}

export async function requireAdmin(): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return profile
}

export async function requireProvider(): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'provider' && profile.role !== 'admin')) {
    throw new Error('Unauthorized: Provider access required')
  }
  return profile
}

export async function requireProviderWithProviderId(): Promise<{
  profile: UserProfile
  providerId: string
}> {
  const profile = await requireProvider()
  if (!profile.provider_id) {
    throw new Error('No provider linked to this account')
  }
  return { profile, providerId: profile.provider_id }
}
