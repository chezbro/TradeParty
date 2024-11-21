import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create a matcher for public routes
const publicRoutes = createRouteMatcher(["/"])

export default clerkMiddleware((auth, req: NextRequest) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Allow public routes
  if (publicRoutes(req)) {
    return NextResponse.next();
  }

  // Handle users who aren't authenticated
  if (!auth.userId && !publicRoutes(req)) {
    const signInUrl = new URL('/sign-in', baseUrl);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is logged in and trying to access the sign-in page,
  // redirect them to the dashboard
  if (auth.userId && req.nextUrl.pathname === '/sign-in') {
    const dashboard = new URL('/', baseUrl);
    return NextResponse.redirect(dashboard);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};