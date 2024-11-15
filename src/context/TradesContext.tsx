import { createContext, useContext, useState, ReactNode } from 'react';

export interface Trade {
    id: string;
    traderId: string;
    traderName: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    entry: number;
    target: number;
    stopLoss: number;
    timestamp: Date;
    leverage?: number;
    margin?: number;
    notes?: string;
}

interface TradesContextType {
    trades: Trade[];
    addTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: ReactNode }) {
    const [trades, setTrades] = useState<Trade[]>([]);

    const addTrade = (trade: Omit<Trade, 'id' | 'timestamp'>) => {
        const newTrade: Trade = {
            ...trade,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
        };
        setTrades(prev => [newTrade, ...prev]);
    };

    return (
        <TradesContext.Provider value={{ trades, addTrade }}>
            {children}
        </TradesContext.Provider>
    );
}

export function useTrades() {
    const context = useContext(TradesContext);
    if (context === undefined) {
        throw new Error('useTrades must be used within a TradesProvider');
    }
    return context;
} 