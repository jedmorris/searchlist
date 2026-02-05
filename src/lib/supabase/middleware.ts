import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect authenticated users away from login page
  if (pathname === '/admin/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // Public routes - always allow
  if (
    pathname === '/admin/login' ||
    pathname === '/auth/register' ||
    pathname === '/auth/accept-invitation' ||
    pathname.startsWith('/api/auth/')
  ) {
    return supabaseResponse
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Get user role from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as UserRole | undefined

    // Admin routes require admin role
    if (role !== 'admin') {
      // If user is a provider, redirect to portal
      if (role === 'provider') {
        const url = request.nextUrl.clone()
        url.pathname = '/portal'
        return NextResponse.redirect(url)
      }
      // Otherwise redirect to home
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Protect portal routes
  if (pathname.startsWith('/portal')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Get user role from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, provider_id')
      .eq('id', user.id)
      .single()

    const role = profile?.role as UserRole | undefined

    // Portal routes require provider or admin role
    if (role !== 'provider' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Providers need to have a linked provider_id (except admins can access without)
    if (role === 'provider' && !profile?.provider_id) {
      // Redirect to a page to complete setup
      if (pathname !== '/portal/setup') {
        const url = request.nextUrl.clone()
        url.pathname = '/portal/setup'
        return NextResponse.redirect(url)
      }
    }
  }

  // Protect API routes that require authentication
  if (pathname.startsWith('/api/portal/') || pathname.startsWith('/api/admin/')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, provider_id')
      .eq('id', user.id)
      .single()

    const role = profile?.role as UserRole | undefined

    // Admin API routes require admin role
    if (pathname.startsWith('/api/admin/') && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Portal API routes require provider or admin role
    if (pathname.startsWith('/api/portal/')) {
      if (role !== 'provider' && role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  return supabaseResponse
}
