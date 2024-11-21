'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { Trade } from '@/types/trade';
import { createClient } from '@supabase/supabase-js';
import { calculateTradePnL, calculateTraderStats } from '@/utils/tradeCalculations';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TradesContextType {
    trades: Trade[];
    addTrade: (trade: Trade) => Promise<void>;
    updateTrade: (trade: Trade) => Promise<void>;
    closeTrade: (tradeId: string, exitPrice: number) => Promise<void>;
    updateCurrentPrices: (prices: Record<string, number>) => void;
    getTraderStats: (traderId: string) => {
        totalPnL: number;
        winRate: number;
        openPositions: number;
        totalTrades: number;
    };
}

// Helper function to convert camelCase to snake_case for Supabase
const toSnakeCase = (trade: Trade) => ({
    id: trade.id,
    symbol: trade.symbol,
    type: trade.type,
    entry: trade.entry,
    target: trade.target,
    stop_loss: trade.stopLoss,
    size: trade.size,
    timestamp: trade.timestamp,
    status: trade.status,
    exit_price: trade.exitPrice,
    exit_timestamp: trade.exitTimestamp,
    profit_loss: trade.profitLoss,
    current_price: trade.currentPrice,
    trader_id: trade.trader.id,
    trader_name: trade.trader.name
});

// Helper function to convert snake_case back to camelCase
const toCamelCase = (data: any): Trade => ({
    id: data.id,
    symbol: data.symbol,
    type: data.type,
    entry: data.entry,
    target: data.target,
    stopLoss: data.stop_loss,
    size: data.size,
    timestamp: data.timestamp,
    status: data.status,
    exitPrice: data.exit_price,
    exitTimestamp: data.exit_timestamp,
    profitLoss: data.profit_loss,
    currentPrice: data.current_price,
    trader: {
        id: data.trader_id,
        name: data.trader_name
    }
});

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export const TradesProvider = ({ children }: { children: React.ReactNode }) => {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const fetchTrades = async () => {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching trades:', error);
                return;
            }

            // Convert snake_case to camelCase for each trade
            setTrades((data || []).map(toCamelCase));
        };

        fetchTrades();

        // Subscribe to real-time changes
        const tradesSubscription = supabase
            .channel('trades_channel')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'trades' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTrades(prev => [toCamelCase(payload.new), ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTrades(prev => prev.map(trade => 
                            trade.id === payload.new.id ? toCamelCase(payload.new) : trade
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setTrades(prev => prev.filter(trade => trade.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            tradesSubscription.unsubscribe();
        };
    }, []);

    const addTrade = async (trade: Trade) => {
        // Generate a new UUID for the trade
        const newTrade = {
            ...trade,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            status: 'OPEN' as const,
            profitLoss: 0,
            currentPrice: trade.entry
        };

        // Convert to snake_case for Supabase
        const supabaseTrade = toSnakeCase(newTrade);
        
        const { error } = await supabase
            .from('trades')
            .insert([supabaseTrade]);

        if (error) {
            console.error('Error adding trade:', error);
            throw error;
        }

        setTrades(prev => [newTrade, ...prev]);
    };

    const updateTrade = async (trade: Trade) => {
        // Convert to snake_case for Supabase
        const supabaseTrade = toSnakeCase(trade);
        
        const { error } = await supabase
            .from('trades')
            .update(supabaseTrade)
            .eq('id', trade.id);

        if (error) {
            console.error('Error updating trade:', error);
            throw error;
        }

        setTrades(prev => prev.map(t => t.id === trade.id ? trade : t));
    };

    const updateCurrentPrices = (prices: Record<string, number>) => {
        setTrades(prevTrades => 
            prevTrades.map(trade => ({
                ...trade,
                currentPrice: prices[trade.symbol] || trade.currentPrice,
                profitLoss: calculateTradePnL({
                    ...trade,
                    currentPrice: prices[trade.symbol] || trade.currentPrice
                })
            }))
        );
    };

    const closeTrade = async (tradeId: string, exitPrice: number) => {
        const trade = trades.find(t => t.id === tradeId);
        if (!trade) return;

        const updatedTrade = {
            ...trade,
            status: 'CLOSED' as const,
            exitPrice,
            exitTimestamp: new Date().toISOString(),
            profitLoss: calculateTradePnL({
                ...trade,
                currentPrice: exitPrice,
                status: 'CLOSED'
            })
        };

        const { error } = await supabase
            .from('trades')
            .update(toSnakeCase(updatedTrade))
            .eq('id', tradeId);

        if (error) throw error;
        
        setTrades(prev => prev.map(t => 
            t.id === tradeId ? updatedTrade : t
        ));
    };

    const getTraderStats = (traderId: string) => {
        const traderTrades = trades.filter(t => t.trader.id === traderId);
        return calculateTraderStats(traderTrades);
    };

    return (
        <TradesContext.Provider value={{
            trades,
            addTrade,
            updateTrade,
            closeTrade,
            updateCurrentPrices,
            getTraderStats
        }}>
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