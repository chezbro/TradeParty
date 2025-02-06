import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/sign-in', '/sign-up', '/auth/callback']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/', req.url)
    redirectUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth pages
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 