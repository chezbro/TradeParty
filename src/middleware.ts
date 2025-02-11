import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/auth/callback',
  '/auth/confirm',
  '/auth/reset',
  '/admin/login',  // Allow access to admin login
  '/'  // Allow access to home page
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session check error:', sessionError)
    }

    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    // Special handling for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login') {
      if (!session) {
        // If no session, redirect to admin login
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        // If not admin, redirect to home
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Regular auth check for non-admin routes
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/sign-in', req.url)
      redirectUrl.searchParams.set('redirect', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

// Optionally configure which paths should be handled by middleware
export const config = {
  matcher: [
    '/api/stream/:path*',
    '/api/health',
    '/profile/:path*',
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}