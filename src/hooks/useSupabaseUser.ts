import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-client';

export const useSupabaseUser = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoaded(true);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
}; 