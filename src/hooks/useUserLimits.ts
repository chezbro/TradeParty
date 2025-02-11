import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const useUserLimits = () => {
  const [isAtCapacity, setIsAtCapacity] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('user_limits')
          .select('total_users, max_users')
          .single();

        if (error) throw error;

        setIsAtCapacity(data.total_users >= data.max_users);
      } catch (error) {
        console.error('Error checking user limits:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLimits();
  }, [supabase]);

  return { isAtCapacity, loading };
}; 