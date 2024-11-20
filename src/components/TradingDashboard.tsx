import { useState } from 'react';
import { TradesFeed } from './TradesFeed';
import { WatchlistContainer } from './WatchlistContainer';
import { FaChartBar, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { TraderProfileModal } from './TraderProfileModal';
import { useWatchlist } from '@/context/WatchlistContext';
import toast from 'react-hot-toast';

interface TraderData {
    userId: string;
    name: string;
    profitLoss: number;
    winRate: number;
    openPositions: number;
    totalTrades: number;
}

interface TradingDashboardProps {
    currentSymbol: string;
    onSymbolSelect: (symbol: string) => void;
}

export const TradingDashboard = ({ 
    currentSymbol,
    onSymbolSelect 
}: TradingDashboardProps) => {
    const { watchlist, addToWatchlist, removeFromWatchlist, isLoading } = useWatchlist();
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
    const [selectedTrader, setSelectedTrader] = useState<TraderData | null>(null);

    const handleTradeSelect = (symbol: string) => {
        onSymbolSelect(symbol);
    };

    const handleStarClick = async (symbol: string) => {
        try {
            if (watchlist.includes(symbol)) {
                await removeFromWatchlist(symbol);
                toast.success(`Removed ${symbol} from watchlist`);
            } else {
                await addToWatchlist(symbol);
                toast.success(`Added ${symbol} to watchlist`);
            }
        } catch (error) {
            console.error('Error managing watchlist:', error);
            toast.error(`Failed to update watchlist: ${error.message}`);
        }
    };

    return (
        <div className="space-y-4">
            <TradesFeed 
                onTradeSelect={handleTradeSelect}
            />
            
            <WatchlistContainer 
                watchlist={watchlist}
                onSymbolSelect={onSymbolSelect}
                onStarClick={handleStarClick}
                isLoading={isLoading}
            />

            <div className="rounded-lg bg-gray-900/50 border border-white/10 overflow-hidden">
                <button 
                    onClick={() => setIsTopTradersExpanded(!isTopTradersExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <h2 className="text-xl text-white font-semibold flex items-center gap-3">
                        <FaChartBar className="text-gray-400" />
                        Top Traders
                    </h2>
                    {isTopTradersExpanded ? (
                        <FaChevronDown className="text-gray-400" />
                    ) : (
                        <FaChevronRight className="text-gray-400" />
                    )}
                </button>
                
                {isTopTradersExpanded && (
                    <div className="p-4 border-t border-white/5">
                        <div className="grid gap-2">
                            {tradersData.map((trader) => (
                                <div 
                                    key={trader.userId}
                                    className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-md transition-colors duration-200 cursor-pointer"
                                    onClick={() => setSelectedTrader(trader)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800/50 border border-white/5 flex items-center justify-center text-sm text-white/80">
                                            {trader.name[0]}
                                        </div>
                                        <div className="text-sm text-white/90">{trader.name}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-sm font-medium ${trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {trader.profitLoss >= 0 ? '+' : ''}${Math.abs(trader.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs text-white/70 w-12 text-right">
                                            {(trader.winRate * 100).toFixed(0)}% WR
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedTrader && (
                <TraderProfileModal
                    trader={selectedTrader}
                    isOpen={!!selectedTrader}
                    onClose={() => setSelectedTrader(null)}
                />
            )}
        </div>
    );
}; 