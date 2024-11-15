import { FaExchangeAlt } from 'react-icons/fa';
import { useTrades } from '@/context/TradesContext';

export const TradesFeed = () => {
    const { trades } = useTrades();

    return (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                    <FaExchangeAlt className="text-green-400" />
                    Live Trades
                </h2>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors">
                        Filter
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {trades.length > 0 ? (
                    trades.map(trade => (
                        <div 
                            key={trade.id} 
                            className="bg-gray-700/50 backdrop-blur rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                        {trade.traderName[0]}
                                    </div>
                                    <span className="text-white font-medium">{trade.traderName}</span>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(trade.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium
                                        ${trade.type === 'BUY' 
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
                        No trades have been placed yet
                    </div>
                )}
            </div>
        </div>
    );
}; 