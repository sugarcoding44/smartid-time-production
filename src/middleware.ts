import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ALWAYS allow home page to pass through - NO AUTHENTICATION CHECK
  if (request.nextUrl.pathname === '/') {
    console.log('🏠 Home page - allowing through without auth check')
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

  // Protected routes - temporarily exclude setup-location to prevent callback redirect issues
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (isProtectedRoute) {
    if (!user) {
      console.log('😫 Redirecting to signin - no user for protected route')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }
  
  // Special handling for setup-location - allow if user exists OR if coming from callback
  if (request.nextUrl.pathname.startsWith('/setup-location')) {
    if (!user) {
      const referer = request.headers.get('referer')
      const isFromCallback = referer && referer.includes('/auth/callback')
      
      if (!isFromCallback) {
        console.log('😫 Redirecting to signin - no user for setup-location and not from callback')
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      } else {
        console.log('🔄 Allowing setup-location access from callback without full auth')
      }
    }
  }

  // Redirect authenticated users away from auth pages - but check setup status first
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    if (request.nextUrl.pathname !== '/auth/callback') {
      // Check if user needs to complete setup (location)
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('institution_id')
          .eq('auth_user_id', user.id)
          .single()
        
        if (userRecord?.institution_id) {
          // Check if institution has location setup
          const { data: locationExists } = await supabase
            .from('institution_locations')
            .select('id')
            .eq('institution_id', userRecord.institution_id)
            .limit(1)
            .single()
          
          if (!locationExists) {
            console.log('🔄 User authenticated but needs location setup - redirecting to setup-location')
            return NextResponse.redirect(new URL('/setup-location', request.url))
          }
        } else {
          console.log('⚠️ User authenticated but no user record found - may need account setup')
        }
      } catch (error) {
        console.log('⚠️ Error checking setup status:', error)
      }
      
      console.log('🔄 Redirecting authenticated user to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
