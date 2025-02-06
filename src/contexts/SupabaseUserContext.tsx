'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase-client';

type SupabaseUserContextType = {
  user: any;
  loading: boolean;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  loading: true,
});

export function SupabaseUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseUserContext.Provider value={{ user, loading }}>
      {children}
    </SupabaseUserContext.Provider>
  );
}

export const useSupabaseUser = () => {
  const context = useContext(SupabaseUserContext);
  if (context === undefined) {
    throw new Error('useSupabaseUser must be used within a SupabaseUserProvider');
  }
  return context;
}; 