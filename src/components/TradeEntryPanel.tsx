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

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-900/50 rounded-lg border border-white/10">
            <div className="space-y-4">
                {!currentSymbol && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Symbol</label>
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            placeholder="BTCUSDT"
                            required
                        />
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setType('LONG')}
                        className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                            type === 'LONG' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                        <FaArrowUp /> Long
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('SHORT')}
                        className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                            type === 'SHORT' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-800 text-gray-300'
                        }`}
                    >
                        <FaArrowDown /> Short
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Entry</label>
                        <input
                            type="number"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            placeholder="0.00"
                            required
                            step="any"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Size</label>
                        <input
                            type="number"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            placeholder="0.00"
                            required
                            step="any"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Target</label>
                        <input
                            type="number"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            placeholder="0.00"
                            required
                            step="any"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Stop Loss</label>
                        <input
                            type="number"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                            placeholder="0.00"
                            required
                            step="any"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                >
                    Enter Trade
                </button>
            </div>
        </form>
    );
}; 