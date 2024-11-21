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
        if (!callId) {
          setMeetingDetails(null);
          return;
        }

        const { data, error: queryError } = await supabase
          .from('meetings')
          .select('name, created_by, status, scheduled_for')
          .eq('call_id', callId)
          .maybeSingle();

        if (queryError) {
          console.error('Supabase error:', queryError);
          throw queryError;
        }
        
        if (data) {
          setMeetingDetails(data);
        } else {
          console.log('No meeting found for callId:', callId);
          setMeetingDetails(null);
        }
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeetingDetails();
  }, [callId, supabase]);

  return { meetingDetails, isLoading, error };
} 