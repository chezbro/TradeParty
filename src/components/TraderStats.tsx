import { FC } from 'react';
import { FaUser, FaChartLine, FaPercent, FaExchangeAlt } from 'react-icons/fa';
import { useTrades } from '@/context/TradesContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export const TraderStats: FC<TraderStatsProps> = ({ trader }) => {
    const { getTraderStats } = useTrades();
    const stats = getTraderStats(trader.userId);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/5 hover:bg-gray-800/70 
                transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2">
                    <FaChartLine className="text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gray-400 text-sm">Total P&L</span>
                </div>
                <div className={`text-lg font-semibold truncate ${
                    stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                    {stats.totalPnL >= 0 ? '+' : ''}${Math.abs(stats.totalPnL).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/5 hover:bg-gray-800/70 
                transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2">
                    <FaPercent className="text-green-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gray-400 text-sm">Win Rate</span>
                </div>
                <div className="text-lg font-semibold text-white">
                    {(stats.winRate * 100).toFixed(1)}%
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/5 hover:bg-gray-800/70 
                transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2">
                    <FaExchangeAlt className="text-purple-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gray-400 text-sm">Open Positions</span>
                </div>
                <div className="text-lg font-semibold text-white">
                    {stats.openPositions}
                </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/5 hover:bg-gray-800/70 
                transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-orange-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gray-400 text-sm">Total Trades</span>
                </div>
                <div className="text-lg font-semibold text-white">
                    {stats.totalTrades}
                </div>
            </div>
        </div>
    );
}; 