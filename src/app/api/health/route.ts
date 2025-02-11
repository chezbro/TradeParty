import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { redis } from '@/lib/meeting-monitor';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check Supabase connection
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Get active meetings count
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('count')
      .eq('status', 'active');
    
    if (meetingsError) throw meetingsError;

    // Get Redis metrics
    const activeParticipants = await redis.get('active_participants_count');
    const totalMeetings = await redis.get('total_meetings_count');
    
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: {
          activeMeetings: meetings[0]?.count || 0,
          activeParticipants: parseInt(String(activeParticipants || '0')),
          totalMeetings: parseInt(String(totalMeetings || '0')),
        },
        services: {
          database: 'connected',
          redis: 'connected'
        }
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