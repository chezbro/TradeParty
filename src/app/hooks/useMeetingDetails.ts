import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

interface MeetingDetails {
  name: string;
  created_by: string;
  scheduled_for: string | null;
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
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('call_id', callId)
          .single();

        if (error) throw error;
        setMeetingDetails(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (callId) {
      fetchMeetingDetails();
    }
  }, [callId]);

  return { meetingDetails, isLoading, error };
} 