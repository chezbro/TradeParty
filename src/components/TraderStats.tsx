import { FaUser, FaChartLine, FaPercent, FaExchangeAlt } from 'react-icons/fa';

interface TraderData {
    userId: string;
    name: string;
    profitLoss: number;
    winRate: number;
    openPositions: number;
    totalTrades: number;
}

interface TraderStatsProps {
    trader: TraderData;
}

export const TraderStats = ({ trader }: TraderStatsProps) => {
    return (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
            {/* Trader Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <FaUser className="text-blue-400" />
                </div>
                <div>
                    <h3 className="text-white font-medium">{trader.name}</h3>
                    <span className={`text-sm ${trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trader.profitLoss >= 0 ? '+' : ''}{trader.profitLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                        <FaPercent className="text-blue-400" />
                        Win Rate
                    </div>
                    <div className="text-white font-medium">
                        {(trader.winRate * 100).toFixed(1)}%
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                        <FaExchangeAlt className="text-blue-400" />
                        Positions
                    </div>
                    <div className="text-white font-medium">
                        {trader.openPositions}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                        <FaChartLine className="text-blue-400" />
                        Trades
                    </div>
                    <div className="text-white font-medium">
                        {trader.totalTrades}
                    </div>
                </div>
            </div>
        </div>
    );
}; 