import { useState, useEffect } from 'react';
import { TraderStats } from './TraderStats';
import { TradesFeed } from './TradesFeed';
import { FaChartBar, FaChevronDown, FaChevronRight, FaStar } from 'react-icons/fa';

interface TraderData {
    userId: string;
    name: string;
    profitLoss: number;
    winRate: number;
    openPositions: number;
    totalTrades: number;
}

interface TradingDashboardProps {
    watchlist: string[];
    onSymbolSelect: (symbol: string) => void;
    onStarClick: (symbol: string) => void;
}

export const TradingDashboard = ({ watchlist, onSymbolSelect, onStarClick }: TradingDashboardProps) => {
    const mockTraders: TraderData[] = [
        {
            userId: '1',
            name: 'Sarah Johnson',
            profitLoss: 15234.50,
            winRate: 0.68,
            openPositions: 3,
            totalTrades: 145
        },
        {
            userId: '2',
            name: 'Michael Chen',
            profitLoss: 8756.20,
            winRate: 0.72,
            openPositions: 2,
            totalTrades: 98
        },
        {
            userId: '3',
            name: 'Alex Thompson',
            profitLoss: -2341.75,
            winRate: 0.45,
            openPositions: 1,
            totalTrades: 67
        },
        {
            userId: '4',
            name: 'Emma Davis',
            profitLoss: 27891.30,
            winRate: 0.81,
            openPositions: 4,
            totalTrades: 203
        },
        {
            userId: '5',
            name: 'James Wilson',
            profitLoss: 5467.90,
            winRate: 0.63,
            openPositions: 2,
            totalTrades: 89
        },
        {
            userId: '6',
            name: 'Lisa Anderson',
            profitLoss: -1234.60,
            winRate: 0.51,
            openPositions: 1,
            totalTrades: 72
        }
    ];

    const [tradersData, setTradersData] = useState<TraderData[]>(mockTraders);
    const [isTopTradersExpanded, setIsTopTradersExpanded] = useState(false);
    const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(false);

    return (
        <div className="space-y-4">
            {/* Top Traders Section */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                <button 
                    onClick={() => setIsTopTradersExpanded(!isTopTradersExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-t-xl"
                >
                    <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                        <FaChartBar className="text-blue-400" />
                        Top Traders
                    </h2>
                    {isTopTradersExpanded ? (
                        <FaChevronDown className="text-gray-400" />
                    ) : (
                        <FaChevronRight className="text-gray-400" />
                    )}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isTopTradersExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="p-4 pt-0">
                        <div className="flex flex-col gap-3">
                            {tradersData.length > 0 ? (
                                tradersData.map(trader => (
                                    <TraderStats 
                                        key={trader.userId}
                                        trader={trader}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No active traders at the moment
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Watchlist Section */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                <button 
                    onClick={() => setIsWatchlistExpanded(!isWatchlistExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-t-xl"
                >
                    <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                        <FaStar className="text-yellow-400" />
                        Watchlist
                    </h2>
                    {isWatchlistExpanded ? (
                        <FaChevronDown className="text-gray-400" />
                    ) : (
                        <FaChevronRight className="text-gray-400" />
                    )}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isWatchlistExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="p-4 pt-0">
                        <div className="flex flex-col gap-3">
                            {watchlist.map((symbol) => (
                                <div 
                                    key={symbol}
                                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer text-gray-200"
                                    onClick={() => onSymbolSelect(symbol)}
                                >
                                    <span>{symbol}</span>
                                    <FaStar 
                                        size={20}
                                        className="text-yellow-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStarClick(symbol);
                                        }}
                                    />
                                </div>
                            ))}
                            {watchlist.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No starred symbols yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trades Feed */}
            <TradesFeed hideHeader={true} />
        </div>
    );
}; 