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
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 
                    transition-all duration-200 rounded-t-xl group"
            >
                <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                    <FaExchangeAlt className="text-green-400 group-hover:rotate-12 transition-transform duration-200" />
                    Active Trades
                </h2>
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <FaChevronDown className="text-gray-400 group-hover:text-gray-300" />
                </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="p-4 pt-0">
                    <div className="flex justify-center w-full mb-4">
                        <div className="inline-flex bg-gray-700/50 backdrop-blur rounded-lg p-1 gap-1">
                            {[
                                { value: "ALL", label: "All" },
                                { value: "LONG", label: "Long" },
                                { value: "SHORT", label: "Short" }
                            ].map(({ value, label }) => (
                                <button 
                                    key={value}
                                    onClick={() => setFilter(value as "ALL" | "LONG" | "SHORT")}
                                    className={`w-20 px-3 py-1.5 rounded-md text-xs font-medium 
                                        transition-all duration-200 relative overflow-hidden
                                        ${filter === value 
                                            ? value === "LONG"
                                                ? 'bg-green-500/20 text-green-400 shadow-sm' 
                                                : value === "SHORT"
                                                    ? 'bg-red-500/20 text-red-400 shadow-sm'
                                                    : 'bg-gray-600 text-white shadow-sm'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {filteredTrades.length > 0 ? (
                            filteredTrades.map(trade => (
                                <div 
                                    key={trade.id} 
                                    className="group bg-gray-700/50 backdrop-blur rounded-xl p-3 
                                        border border-gray-600/50 hover:border-gray-500/50 
                                        hover:bg-gray-700/70 transition-all duration-200 
                                        hover:shadow-lg hover:shadow-black/10"
                                >
                                    {/* Top row: Trader info and timestamp */}
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-600/80 
                                                flex items-center justify-center text-xs
                                                group-hover:bg-gray-600 transition-colors">
                                                {getTraderInitials(trade)}
                                            </div>
                                            <span className="text-white/90 font-medium text-xs">
                                                {getTraderName(trade)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px]">
                                            {Date.now() - new Date(trade.timestamp).getTime() < 300000 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 
                                                        animate-pulse"></span>
                                                    <span className="text-green-400">Live</span>
                                                </span>
                                            )}
                                            <span className="text-gray-400">
                                                {new Date(trade.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom row: Trade details in a more compact layout */}
                                    <div className="flex items-center gap-4">
                                        {/* Left side: Symbol and type */}
                                        <div className="flex items-center gap-2 min-w-[100px]">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium
                                                ${trade.type === 'LONG' 
                                                    ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30' 
                                                    : 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30'
                                                } transition-colors`}
                                            >
                                                {trade.type}
                                            </span>
                                            <span className="text-sm font-semibold text-white/90">
                                                {trade.symbol}
                                            </span>
                                        </div>

                                        {/* Right side: Trade values in a more compact layout */}
                                        <div className="flex gap-4 ml-auto">
                                            {[
                                                { label: "Entry", value: trade.entry, color: "blue" },
                                                { label: "Target", value: trade.target, color: "green" },
                                                { label: "Stop", value: trade.stopLoss, color: "red" }
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className="text-right min-w-[50px]">
                                                    <div className="text-gray-400 text-[10px] uppercase tracking-wide leading-tight">
                                                        {label}
                                                    </div>
                                                    <div className={`text-${color}-400 text-xs font-medium leading-tight`}>
                                                        ${value.toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
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