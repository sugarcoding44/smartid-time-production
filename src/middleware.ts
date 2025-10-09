import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/auth/signin', '/auth/signup', '/auth/callback', '/auth/confirm-email']
const API_PATHS = ['/api/']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Allow public paths and Next.js internals without auth
  if (PUBLIC_PATHS.includes(pathname) || 
      pathname.startsWith('/_next') || 
      pathname === '/favicon.ico') {
    return response
  }

  // Allow API routes without auth check
  if (API_PATHS.some(path => pathname.startsWith(path))) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('🛡️ Middleware:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userEmail: user?.email
  })

  // All routes except auth and home require authentication
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isHome = request.nextUrl.pathname === '/'
  const isSetupLocation = request.nextUrl.pathname.startsWith('/setup-location')

  if (!isAuthPage && !isHome) {
    if (!user) {
      console.log('😫 Redirecting to signin - no user for protected route:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // If authenticated, enforce location-setup globally (except on auth and setup-location pages)
  if (user && !isAuthPage) {
    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('institution_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userRecord?.institution_id) {
        const { data: locationExists, error: locErr } = await supabase
          .from('institution_locations')
          .select('id')
          .eq('institution_id', userRecord.institution_id)
          .limit(1)
          .maybeSingle()

        if (!locationExists && !isSetupLocation) {
          console.log('🔄 User needs location setup - redirecting to /setup-location')
          return NextResponse.redirect(new URL('/setup-location', request.url))
        }
        // If location exists and user visits /setup-location, send to dashboard instead
        if (locationExists && isSetupLocation) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      console.log('⚠️ Error enforcing setup status:', error)
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user && request.nextUrl.pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Run middleware on everything except Next internals, images, favicon, and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
