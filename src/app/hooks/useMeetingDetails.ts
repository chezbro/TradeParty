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

  // Add caching
  const queryKey = `meeting-${callId}`;
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    async function fetchMeetingDetails() {
      // Check cache first
      const cached = localStorage.getItem(queryKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes cache
          setCachedData(data);
          return;
        }
      }

      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('name, created_by, scheduled_for, status') // Select only needed fields
          .eq('call_id', callId)
          .single()
          .limit(1); // Explicit limit

        if (error) throw error;
        
        // Cache the result
        localStorage.setItem(queryKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        
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