import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  // Debug logging
  console.log('Middleware executing with:', {
    pathname: req.nextUrl.pathname,
    userId: auth.session?.userId,
    sessionId: auth.session?.id,
    env: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL,
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL
  });

  // Allow public routes
  const publicRoutes = ["/", "/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname === route);

  console.log('Route check:', {
    isPublicRoute,
    currentPath: req.nextUrl.pathname
  });

  if (isPublicRoute) {
    console.log('Allowing public route access');
    return NextResponse.next();
  }

  // If user is not authenticated
  if (!auth.session) {
    console.log('User not authenticated, preparing redirect');

    // Get the sign-in URL from environment
    const signInUrl = new URL(
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'https://accounts.tradeparty.co/sign-in'
    );
    
    console.log('Redirect preparation:', {
      originalUrl: req.url,
      signInBaseUrl: signInUrl.origin,
      signInFullUrl: signInUrl.toString()
    });

    // Set the redirect URL
    signInUrl.searchParams.set("redirect_url", req.url);
    
    console.log('Final redirect URL:', signInUrl.toString());
    
    return NextResponse.redirect(signInUrl);
  }

  console.log('User authenticated, proceeding');
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};