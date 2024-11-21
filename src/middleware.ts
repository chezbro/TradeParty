import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withClerkMiddleware((req: NextRequest) => {
  const auth = getAuth(req);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

  // Public routes that don't require authentication
  const isPublicRoute = req.nextUrl.pathname === "/";
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If the user is not authenticated and not on a public route
  if (!auth.userId && !isPublicRoute) {
    let redirectUrl = `${signInUrl}?redirect_url=${encodeURIComponent(req.url)}`;
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is signed in and trying to access sign-in page
  if (auth.userId && req.nextUrl.pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};