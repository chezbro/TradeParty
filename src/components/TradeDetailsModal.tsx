import { FC } from 'react';
import { FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Trade {
    id: string;
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number;
    currentPrice: number;
    profitLoss: number;
    timestamp: string;
    size: number;
}

interface TradeDetailsModalProps {
    trade: Trade | null;
    onClose: () => void;
    traderName: string;
}

export const TradeDetailsModal: FC<TradeDetailsModalProps> = ({ trade, onClose, traderName }) => {
    if (!trade) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <FaTimes />
                </button>
                
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-1">Trade Details</h3>
                    <p className="text-gray-400">by {traderName}</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-300">Symbol</span>
                        <span className="text-white font-medium">{trade.symbol}</span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                        <span className="text-gray-300">Direction</span>
                        <span className={`flex items-center gap-2 font-medium ${
                            trade.direction === 'long' ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {trade.direction.toUpperCase()}
                            {trade.direction === 'long' ? <FaArrowUp /> : <FaArrowDown />}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-sm mb-1">Entry Price</div>
                            <div className="text-white font-medium">${trade.entryPrice}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-sm mb-1">Current Price</div>
                            <div className="text-white font-medium">${trade.currentPrice}</div>
                        </div>
                    </div>

                    <div className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">P/L</div>
                        <div className={`text-lg font-semibold ${
                            trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                            ${trade.profitLoss.toFixed(2)}
                        </div>
                    </div>

                    <div className="text-xs text-gray-400">
                        Opened at {new Date(trade.timestamp).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}; 