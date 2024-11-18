import React, { useState } from 'react';
import { Trade } from '@/types/trade';
import { TradeSuccessAnimation } from './TradeSuccessAnimation';
import Confetti from 'react-confetti';
import { useUser } from '@clerk/nextjs';
import { useTrades } from '@/context/TradesContext';

interface TradeEntryPanelProps {
    onNewTrade: (trade: Trade) => void;
    currentSymbol?: string;
}

export const TradeEntryPanel: React.FC<TradeEntryPanelProps> = ({ onNewTrade, currentSymbol = '' }) => {
    const { user } = useUser();
    const { addTrade } = useTrades();
    const [tradeData, setTradeData] = useState({
        symbol: currentSymbol,
        type: 'LONG',
        entry: '',
        target: '',
        stopLoss: '',
        size: ''
    });
    const [showSuccess, setShowSuccess] = useState<'LONG' | 'SHORT' | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Format user name as "FirstName L."
    const formatUserName = () => {
        if (!user) return 'Anonymous Trader';
        
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        
        if (firstName && lastName) {
            return `${firstName} ${lastName.charAt(0)}.`;
        } else if (user.fullName) {
            const names = user.fullName.split(' ');
            if (names.length > 1) {
                return `${names[0]} ${names[names.length - 1].charAt(0)}.`;
            }
            return user.fullName;
        }
        
        return user.username || 'Anonymous Trader';
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
            currentPrice: parseFloat(tradeData.entry),
            trader: {
                name: formatUserName(),
                id: user?.id || 'anonymous'
            }
        };

        try {
            await addTrade(trade);
            onNewTrade(trade);
            
            // Trigger both animations
            setShowSuccess(trade.type);
            setShowConfetti(true);
            
            // Clean up animations
            setTimeout(() => {
                setShowSuccess(null);
                setShowConfetti(false);
            }, 5000);
            
            // Reset form
            setTradeData({
                symbol: currentSymbol,
                type: 'LONG',
                entry: '',
                target: '',
                stopLoss: '',
                size: ''
            });
        } catch (error) {
            console.error('Error adding trade:', error);
            // You might want to show an error message to the user here
        }
    };

    return (
        <>
            {/* Confetti overlay */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                    colors={[
                        '#10B981', // Emerald-500
                        '#34D399', // Emerald-400
                        '#6EE7B7', // Emerald-300
                        '#A7F3D0', // Emerald-200
                        '#D1FAE5'  // Emerald-100
                    ]}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Success animation */}
            {showSuccess && <TradeSuccessAnimation type={showSuccess} />}

            {/* Form content remains the same */}
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
        </>
    );
}; 