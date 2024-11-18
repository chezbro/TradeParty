import { createContext, useContext, useState, useEffect } from 'react';
import { Trade } from '@/types/trade';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TradesContextType {
    trades: Trade[];
    addTrade: (trade: Trade) => Promise<void>;
    updateTrade: (trade: Trade) => Promise<void>;
    deleteTrade: (tradeId: string) => Promise<void>;
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
    profit_loss: trade.profitLoss,
    current_price: trade.currentPrice,
    trader: trade.trader
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
    profitLoss: data.profit_loss,
    currentPrice: data.current_price,
    trader: data.trader
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
        // Convert to snake_case for Supabase
        const supabaseTrade = toSnakeCase(trade);
        
        const { error } = await supabase
            .from('trades')
            .insert([supabaseTrade]);

        if (error) {
            console.error('Error adding trade:', error);
            throw error;
        }

        setTrades(prev => [trade, ...prev]);
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

    const deleteTrade = async (tradeId: string) => {
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId);

        if (error) {
            console.error('Error deleting trade:', error);
            throw error;
        }

        setTrades(prev => prev.filter(t => t.id !== tradeId));
    };

    return (
        <TradesContext.Provider value={{ trades, addTrade, updateTrade, deleteTrade }}>
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