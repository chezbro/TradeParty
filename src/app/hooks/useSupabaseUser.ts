import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface User {
  id: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export const useSupabaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.user_metadata?.name,
          imageUrl: session.user.user_metadata?.avatar_url
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || undefined,
          name: session.user.user_metadata?.name,
          imageUrl: session.user.user_metadata?.avatar_url
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return { user, isLoaded };
}; 