import { NextResponse } from 'next/server';

export async function POST() {
  // Temporarily disabled Stripe integration
  return NextResponse.json(
    { 
      message: 'Payments temporarily disabled',
      url: null 
    },
    { 
      status: 503 
    }
  );
}

/* Original Stripe implementation commented out for now
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      // ... stripe configuration
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
*/ 