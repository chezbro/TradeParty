import React, { createContext, useContext, useState } from 'react';
import { Trade } from '@/types/trade';

interface TradesContextType {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  // Add other trade-related functions as needed
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export const TradesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const addTrade = (trade: Trade) => {
    setTrades(prev => [...prev, trade]);
  };

  return (
    <TradesContext.Provider value={{ trades, addTrade }}>
      {children}
    </TradesContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
}; 