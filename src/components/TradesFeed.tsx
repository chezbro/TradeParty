import { FaExchangeAlt, FaChevronDown, FaUser, FaClock, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { BsCursor, BsArrowDownRight, BsArrowUpRight } from 'react-icons/bs';
import { useTrades } from '@/context/TradesContext';
import { useState } from 'react';
import { Trade } from '@/types/trade';

interface TradesFeedProps {
    hideHeader?: boolean;
}

export const TradesFeed = ({ hideHeader = false }: TradesFeedProps) => {
    const { trades } = useTrades();
    const [filter, setFilter] = useState<"ALL" | "LONG" | "SHORT">("ALL");
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 w-full max-w-full overflow-hidden">
            {!hideHeader && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-700/30 
                        transition-all duration-200 rounded-t-xl group"
                >
                    <h2 className="text-lg text-white font-semibold flex items-center gap-2">
                        <FaExchangeAlt className="text-green-400 group-hover:rotate-12 transition-transform duration-200" />
                        Active Trades
                    </h2>
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <FaChevronDown className="text-gray-400 group-hover:text-gray-300" />
                    </div>
                </button>
            )}
            
            {(isExpanded || hideHeader) && (
                <div className="p-2 w-full">
                    <div className="flex justify-center w-full mb-2">
                        <div className="inline-flex bg-gray-700/50 backdrop-blur rounded-lg p-0.5 gap-0.5">
                            {[
                                { value: "ALL", label: "All" },
                                { value: "LONG", label: "Long" },
                                { value: "SHORT", label: "Short" }
                            ].map(({ value, label }) => (
                                <button 
                                    key={value}
                                    onClick={() => setFilter(value as "ALL" | "LONG" | "SHORT")}
                                    className={`px-2 py-1 rounded text-xs font-medium 
                                        transition-all duration-200
                                        ${filter === value 
                                            ? value === "LONG"
                                                ? 'bg-green-500/20 text-green-400' 
                                                : value === "SHORT"
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-gray-600 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-600/50'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2 w-full">
                        {filteredTrades.length > 0 ? (
                            filteredTrades.map(trade => (
                                <div 
                                    key={trade.id} 
                                    className="w-full group bg-gray-700/30 hover:bg-gray-700/50 backdrop-blur rounded-lg p-2
                                        border border-gray-600/30 hover:border-gray-500/50 
                                        transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <span className="text-sm font-bold text-white truncate">
                                                {trade.symbol}
                                            </span>
                                            {trade.type === 'LONG' ? (
                                                <FaArrowUp className="text-green-400 text-xs flex-shrink-0" />
                                            ) : (
                                                <FaArrowDown className="text-red-400 text-xs flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {Date.now() - new Date(trade.timestamp).getTime() < 300000 && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            )}
                                            <span className="text-gray-400 text-xs">
                                                {new Date(trade.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5 mt-1.5 w-full">
                                        <div className="flex items-center gap-1 bg-gray-800/40 rounded px-1.5 py-1 group/tooltip relative">
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] 
                                                font-medium bg-gray-900 text-gray-200 rounded opacity-0 invisible
                                                group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200">
                                                Entry Price
                                            </span>
                                            <BsCursor className="text-blue-400 text-[10px]" />
                                            <span className="text-blue-400 text-xs font-medium truncate">
                                                ${trade.entry.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-gray-800/40 rounded px-1.5 py-1 group/tooltip relative">
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] 
                                                font-medium bg-gray-900 text-gray-200 rounded opacity-0 invisible
                                                group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200">
                                                Take Profit
                                            </span>
                                            <BsArrowUpRight className="text-green-400 text-[10px]" />
                                            <span className="text-green-400 text-xs font-medium truncate">
                                                ${trade.target.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-gray-800/40 rounded px-1.5 py-1 group/tooltip relative">
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] 
                                                font-medium bg-gray-900 text-gray-200 rounded opacity-0 invisible
                                                group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200">
                                                Stop Loss
                                            </span>
                                            <BsArrowDownRight className="text-red-400 text-[10px]" />
                                            <span className="text-red-400 text-xs font-medium truncate">
                                                ${trade.stopLoss.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-xs">
                                        <FaUser className="text-[10px]" />
                                        <span className="truncate">{getTraderName(trade)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400 text-sm">
                                No active trades
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}; 