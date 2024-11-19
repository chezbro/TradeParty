"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@clerk/nextjs';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID available yet');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        console.log('Fetching watchlist for user:', user.id);
        
        const { data, error } = await supabase
          .from('watchlist')
          .select('symbol')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        console.log('Fetched watchlist data:', data);
        setWatchlist(data.map(item => item.symbol));
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('watchlist_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'watchlist',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'INSERT') {
            setWatchlist(prev => [...prev, payload.new.symbol]);
          } else if (payload.eventType === 'DELETE') {
            setWatchlist(prev => prev.filter(symbol => symbol !== payload.old.symbol));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  const addToWatchlist = async (symbol: string) => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    try {
      console.log('Adding to watchlist:', { symbol, userId: user.id });
      
      // Optimistically update the UI
      setWatchlist(prev => [...prev, symbol]);

      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol
        });

      if (error) {
        // Revert optimistic update if there's an error
        setWatchlist(prev => prev.filter(s => s !== symbol));
        throw error;
      }

      console.log('Successfully added to watchlist');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  return (
    <WatchlistContext.Provider value={{ 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist,
      isLoading 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
} 