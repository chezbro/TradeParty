import { FaExchangeAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useTrades } from '@/context/TradesContext';
import { useState, useEffect } from 'react';
import { Trade } from '@/types/trade';
import Confetti from 'react-confetti';

export const TradesFeed = () => {
    const { trades } = useTrades();
    const [filter, setFilter] = useState<"ALL" | "LONG" | "SHORT">("ALL");
    const [isExpanded, setIsExpanded] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [lastTradeCount, setLastTradeCount] = useState(trades.length);

    // Monitor trades for changes
    useEffect(() => {
        if (trades.length > lastTradeCount) {
            // New trade was added
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
        }
        setLastTradeCount(trades.length);
    }, [trades.length, lastTradeCount]);

    const filteredTrades = trades.filter(trade => 
        filter === "ALL" ? true : trade.type === filter
    );

    // Helper function to get trader initials
    const getTraderInitials = (trade: Trade) => {
        return trade.trader?.name?.[0] || '?';
    };

    // Helper function to get trader name
    const getTraderName = (trade: Trade) => {
        return trade.trader?.name || 'Anonymous Trader';
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
            {/* Confetti overlay */}
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                    colors={['#10B981', '#34D399', '#6EE7B7', '#A7F3D0']} // Green theme colors
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                />
            )}

            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-t-xl"
            >
                <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                    <FaExchangeAlt className="text-green-400" />
                    Active Trades
                </h2>
                {isExpanded ? (
                    <FaChevronDown className="text-gray-400" />
                ) : (
                    <FaChevronRight className="text-gray-400" />
                )}
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="p-4 pt-0">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-center w-full">
                            <div className="inline-flex bg-gray-700/50 backdrop-blur rounded-lg p-1 gap-1">
                                <button 
                                    onClick={() => setFilter("ALL")}
                                    className={`w-16 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                                        ${filter === "ALL" 
                                            ? 'bg-gray-600 text-white shadow-sm' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setFilter("LONG")}
                                    className={`w-16 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                                        ${filter === "LONG" 
                                            ? 'bg-green-500/20 text-green-400 shadow-sm' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'}`}
                                >
                                    Long
                                </button>
                                <button 
                                    onClick={() => setFilter("SHORT")}
                                    className={`w-16 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                                        ${filter === "SHORT" 
                                            ? 'bg-red-500/20 text-red-400 shadow-sm' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'}`}
                                >
                                    Short
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {filteredTrades.length > 0 ? (
                            filteredTrades.map(trade => (
                                <div 
                                    key={trade.id} 
                                    className="bg-gray-700/50 backdrop-blur rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                                {getTraderInitials(trade)}
                                            </div>
                                            <span className="text-white font-medium">
                                                {getTraderName(trade)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {new Date(trade.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium
                                                ${trade.type === 'LONG' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}
                                            >
                                                {trade.type}
                                            </span>
                                            <span className="text-lg font-semibold text-white">
                                                {trade.symbol}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <div className="text-gray-400 mb-1">Entry</div>
                                                <div className="text-blue-400 font-medium">${trade.entry}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-gray-400 mb-1">Target</div>
                                                <div className="text-green-400 font-medium">${trade.target}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-gray-400 mb-1">Stop</div>
                                                <div className="text-red-400 font-medium">${trade.stopLoss}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No active trades at the moment
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 