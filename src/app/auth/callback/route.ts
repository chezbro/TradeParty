import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('Auth callback initiated');
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Log all search params for debugging
    console.log('Callback URL params:', Object.fromEntries(searchParams.entries()));

    if (error) {
      console.error('OAuth error from provider:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/sign-in?error=${error}&error_description=${errorDescription}`, req.url)
      );
    }

    if (!code) {
      console.error('No code received in callback');
      return NextResponse.redirect(new URL('/sign-in?error=no_code', req.url));
    }

    console.log('Exchanging code for session...');
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Session exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/sign-in?error=exchange_failed&error_description=${exchangeError.message}`, req.url)
      );
    }

    // Verify session was created
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session verification error:', sessionError);
      return NextResponse.redirect(
        new URL(`/sign-in?error=session_verification_failed`, req.url)
      );
    }

    if (!session) {
      console.error('No session created after exchange');
      return NextResponse.redirect(new URL('/sign-in?error=no_session', req.url));
    }

    console.log('Authentication successful, redirecting to home');
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Unhandled auth callback error:', error);
    return NextResponse.redirect(
      new URL('/sign-in?error=unhandled_callback_error', req.url)
    );
  }
} 