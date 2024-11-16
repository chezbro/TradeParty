import React, { useState } from 'react';
import { Trade } from '@/types/trade';

interface TradeEntryPanelProps {
    onNewTrade: (trade: Trade) => void;
    currentSymbol?: string;
}

export const TradeEntryPanel: React.FC<TradeEntryPanelProps> = ({ onNewTrade, currentSymbol = '' }) => {
    const [tradeData, setTradeData] = useState({
        symbol: currentSymbol,
        type: 'LONG',
        entry: '',
        target: '',
        stopLoss: '',
        size: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trade: Trade = {
            id: Math.random().toString(36).substring(7),
            symbol: tradeData.symbol,
            type: tradeData.type as 'LONG' | 'SHORT',
            entry: parseFloat(tradeData.entry),
            target: parseFloat(tradeData.target),
            stopLoss: parseFloat(tradeData.stopLoss),
            size: parseFloat(tradeData.size),
            timestamp: Date.now(),
            status: 'OPEN',
            profitLoss: 0,
            currentPrice: parseFloat(tradeData.entry)
        };

        onNewTrade(trade);
        
        // Reset form
        setTradeData({
            symbol: currentSymbol,
            type: 'LONG',
            entry: '',
            target: '',
            stopLoss: '',
            size: ''
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Symbol"
                        value={tradeData.symbol}
                        onChange={(e) => setTradeData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                        className="flex-1 bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                            focus:outline-none focus:border-emerald-500/50"
                    />
                    <select
                        value={tradeData.type}
                        onChange={(e) => setTradeData(prev => ({ ...prev, type: e.target.value }))}
                        className="bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                            focus:outline-none focus:border-emerald-500/50"
                    >
                        <option value="LONG">Long</option>
                        <option value="SHORT">Short</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    step="any"
                    placeholder="Entry"
                    value={tradeData.entry}
                    onChange={(e) => setTradeData(prev => ({ ...prev, entry: e.target.value }))}
                    className="bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                        focus:outline-none focus:border-emerald-500/50"
                />
                <input
                    type="number"
                    step="any"
                    placeholder="Size"
                    value={tradeData.size}
                    onChange={(e) => setTradeData(prev => ({ ...prev, size: e.target.value }))}
                    className="bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                        focus:outline-none focus:border-emerald-500/50"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    step="any"
                    placeholder="Target"
                    value={tradeData.target}
                    onChange={(e) => setTradeData(prev => ({ ...prev, target: e.target.value }))}
                    className="bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                        focus:outline-none focus:border-emerald-500/50"
                />
                <input
                    type="number"
                    step="any"
                    placeholder="Stop Loss"
                    value={tradeData.stopLoss}
                    onChange={(e) => setTradeData(prev => ({ ...prev, stopLoss: e.target.value }))}
                    className="bg-gray-900 border border-white/10 rounded px-3 py-1.5 text-sm text-white/90
                        focus:outline-none focus:border-emerald-500/50"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium
                    py-2 px-4 rounded transition-colors duration-200"
            >
                Enter Trade
            </button>
        </form>
    );
}; 