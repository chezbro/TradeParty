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
  '/'  // Allow access to home page
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    console.log('Middleware checking auth for path:', req.nextUrl.pathname);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session check error:', sessionError);
    }

    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    console.log('Route access check:', {
      path: req.nextUrl.pathname,
      isPublicRoute,
      hasSession: !!session
    });

    // If no session and trying to access protected route
    if (!session && !isPublicRoute) {
      console.log('Redirecting to sign-in: no session for protected route');
      const redirectUrl = new URL('/sign-in', req.url)
      redirectUrl.searchParams.set('redirect', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Allow the auth callback to proceed even with a session
    if (req.nextUrl.pathname.startsWith('/auth/callback')) {
      console.log('Allowing auth callback to proceed');
      return res
    }

    // If session exists and trying to access auth pages
    if (session && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      console.log('Redirecting to home: authenticated user accessing auth page');
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
} 