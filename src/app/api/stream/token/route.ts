import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { StreamClient } from "@stream-io/node-sdk";
import { NextResponse } from 'next/server';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY!;

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

    const token = streamClient.generateUserToken({
      user_id: session.user.id,
      exp: expirationTime,
      iat: issuedAt
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Stream token generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 