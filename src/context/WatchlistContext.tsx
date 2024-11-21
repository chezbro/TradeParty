"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const { data, error } = await supabase
          .from('watchlist')
          .select('symbol')
          .order('created_at', { ascending: true });

        if (error) throw error;

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
        },
        (payload) => {
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
  }, [supabase]);

  const addToWatchlist = async (symbol: string) => {
    try {
      setWatchlist(prev => [...prev, symbol]);

      const { error } = await supabase
        .from('watchlist')
        .insert({
          symbol
        });

      if (error) {
        setWatchlist(prev => prev.filter(s => s !== symbol));
        throw error;
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
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