'use client';
import { useState, useEffect } from 'react';
import { useTrades } from '@/context/TradesContext';
import { Trade } from '@/types/trade';
import supabase from '@/lib/supabase-client';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface TradeEntryPanelProps {
    onNewTrade: (trade: Trade) => void;
    currentSymbol?: string;
}

export const TradeEntryPanel = ({ onNewTrade, currentSymbol }: TradeEntryPanelProps) => {
    const [user, setUser] = useState<any>(null);
    const { addTrade } = useTrades();
    const [symbol, setSymbol] = useState(currentSymbol || '');
    const [type, setType] = useState<'LONG' | 'SHORT'>('LONG');
    const [entry, setEntry] = useState('');
    const [target, setTarget] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [size, setSize] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (currentSymbol) {
            setSymbol(currentSymbol);
        }
    }, [currentSymbol]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please sign in to enter trades');
            return;
        }

        try {
            const trade: Trade = {
                id: crypto.randomUUID(),
                symbol: symbol.toUpperCase(),
                type,
                entry: parseFloat(entry),
                target: parseFloat(target),
                stopLoss: parseFloat(stopLoss),
                size: parseFloat(size),
                timestamp: new Date().toISOString(),
                status: 'OPEN',
                currentPrice: parseFloat(entry),
                profitLoss: 0,
                trader: {
                    id: user.id,
                    name: user.email || 'Anonymous'
                }
            };

            await addTrade(trade);
            onNewTrade(trade);
            toast.success('Trade added successfully!');

            // Reset form
            setEntry('');
            setTarget('');
            setStopLoss('');
            setSize('');
        } catch (error) {
            console.error('Error adding trade:', error);
            toast.error('Failed to add trade');
        }
    };

    // ... rest of your component (render JSX)
}; 