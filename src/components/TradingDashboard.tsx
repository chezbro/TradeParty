import { useState, useEffect } from 'react';
import { TraderStats } from './TraderStats';
import { FaChartBar } from 'react-icons/fa';

interface TraderData {
    userId: string;
    name: string;
    profitLoss: number;
    winRate: number;
    openPositions: number;
}

export const TradingDashboard = () => {
    const [tradersData, setTradersData] = useState<TraderData[]>([]);

    return (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                    <FaChartBar className="text-blue-400" />
                    Traders Performance
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        Last Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tradersData.length > 0 ? (
                    tradersData.map(trader => (
                        <TraderStats 
                            key={trader.userId}
                            trader={trader}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-400">
                        No active traders at the moment
                    </div>
                )}
            </div>
        </div>
    );
}; 