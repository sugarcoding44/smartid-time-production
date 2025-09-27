import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    if (request.nextUrl.pathname !== '/auth/callback') {
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
