import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface MeetingDetails {
  name: string;
  created_by: string;
  scheduled_for?: string | null;
  status: string;
}

export function useMeetingDetails(callId: string) {
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchMeetingDetails() {
      try {
        console.log('Fetching meeting details for callId:', callId);
        
        const { data, error } = await supabase
          .from('meetings')
          .select('name, created_by, status, scheduled_for')
          .eq('call_id', callId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Meeting details fetched:', data);
        setMeetingDetails(data);
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (callId) {
      fetchMeetingDetails();
    }
  }, [callId, supabase]);

  return { meetingDetails, isLoading, error };
} 