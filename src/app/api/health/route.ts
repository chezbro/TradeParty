import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET() {
  try {
    // Check Supabase connection
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('meetings').select('count');
    if (error) throw error;

    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      },
      { status: 503 }
    );
  }
} 