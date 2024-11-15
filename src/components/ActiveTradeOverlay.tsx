import { FC, useState } from 'react';
import { FaDollarSign, FaInfoCircle } from 'react-icons/fa';

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

interface ActiveTradeOverlayProps {
    trades: Trade[];
    onTradeClick: (trade: Trade) => void;
}

export const ActiveTradeOverlay: FC<ActiveTradeOverlayProps> = ({ trades, onTradeClick }) => {
    if (!trades.length) return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
            <div className="space-y-2">
                {trades.map(trade => (
                    <div 
                        key={trade.id}
                        onClick={() => onTradeClick(trade)}
                        className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.symbol}
                            </span>
                            <span className="text-xs text-gray-400">
                                {trade.size} lots
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${trade.profitLoss.toFixed(2)}
                            </span>
                            <FaInfoCircle className="text-gray-400 hover:text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 