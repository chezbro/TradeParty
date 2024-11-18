import { FaUser, FaChartLine, FaPercent, FaExchangeAlt } from 'react-icons/fa';
import { useUser } from "@clerk/nextjs";

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

export const TraderStats: React.FC<TraderStatsProps> = ({ trader }) => {
    const { user } = useUser();

    return (
        <div className="rounded-lg bg-gray-900/50 border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        <img 
                            src={user?.imageUrl || "https://picsum.photos/seed/default/200/200"}
                            alt={trader.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Trader Info */}
                    <div>
                        <h3 className="font-medium text-white">{trader.name}</h3>
                        <p className="text-sm text-emerald-400">Active Trader</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
                <div className="bg-gray-900/50 p-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                        <FaChartLine />
                        <span>P/L</span>
                    </div>
                    <div className={`text-lg font-semibold ${
                        trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        ${trader.profitLoss.toFixed(2)}
                    </div>
                </div>
                <div className="bg-gray-900/50 p-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                        <FaPercent />
                        <span>Win Rate</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                        {trader.winRate}%
                    </div>
                </div>
                <div className="bg-gray-900/50 p-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                        <FaUser />
                        <span>Positions</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                        {trader.openPositions || 0}
                    </div>
                </div>
                <div className="bg-gray-900/50 p-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                        <FaExchangeAlt />
                        <span>Trades</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                        {trader.totalTrades}
                    </div>
                </div>
            </div>
        </div>
    );
}; 