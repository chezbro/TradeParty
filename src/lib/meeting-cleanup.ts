import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function cleanupMeeting(callId: string) {
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update meeting status
    await supabase
      .from('meetings')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('call_id', callId);

    // Cleanup any associated resources
    // Add any additional cleanup needed for your application
    
  } catch (error) {
    console.error('Meeting cleanup error:', error);
    Sentry.captureException(error);
  }
} 