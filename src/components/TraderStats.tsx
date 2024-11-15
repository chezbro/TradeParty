import { FC } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface TraderStatsProps {
    trader: {
        name: string;
        profitLoss: number;
        winRate: number;
        totalTrades: number;
        // Add other properties as needed
    };
}

export const TraderStats: FC<TraderStatsProps> = ({ trader }) => {
    const isProfitable = trader.profitLoss > 0;

    return (
        <div className="bg-gray-700/50 backdrop-blur rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                        {trader.name[0]}
                    </div>
                    <h3 className="text-white font-medium">{trader.name}</h3>
                </div>
                <div className={`flex items-center gap-1 ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfitable ? <FaArrowUp /> : <FaArrowDown />}
                </div>
            </div>
            <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">P/L</span>
                        <span className={`text-lg font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                            ${Math.abs(trader.profitLoss).toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                        <div className="text-blue-400 font-semibold">{trader.winRate}%</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm mb-1">Positions</div>
                        <div className="text-yellow-400 font-semibold">{trader.totalTrades}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 