import { Dialog } from '@headlessui/react';
import { FaTimes, FaChartLine, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { TraderData } from './TradingDashboard';

interface TraderProfileModalProps {
    trader: TraderData;
    isOpen: boolean;
    onClose: () => void;
}

export const TraderProfileModal = ({ trader, isOpen, onClose }: TraderProfileModalProps) => {
    const recentTrades = [
        { symbol: 'BTC/USD', profit: 234.50, timestamp: '2h ago', type: 'Long' },
        { symbol: 'ETH/USD', profit: -122.30, timestamp: '5h ago', type: 'Short' },
        { symbol: 'SOL/USD', profit: 567.80, timestamp: '1d ago', type: 'Long' },
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-gray-900 border border-white/10">
                    <div className="relative p-6">
                        <button 
                            onClick={onClose}
                            className="absolute right-4 top-4 text-white/50 hover:text-white/80 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl text-white/90 font-medium">
                                {trader.name[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{trader.name}</h2>
                                <p className="text-white/50">Active since Jan 2024</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-white/50 text-sm mb-1">Total P/L</div>
                                <div className={`text-xl font-semibold ${trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${trader.profitLoss.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-white/50 text-sm mb-1">Win Rate</div>
                                <div className="text-xl font-semibold text-white">
                                    {(trader.winRate * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-white/50 text-sm mb-1">Total Trades</div>
                                <div className="text-xl font-semibold text-white">
                                    {trader.totalTrades}
                                </div>
                            </div>
                        </div>

                        {/* Recent Trades */}
                        <div>
                            <h3 className="text-white/90 font-medium mb-3 flex items-center gap-2">
                                <FaHistory className="text-blue-400" />
                                Recent Trades
                            </h3>
                            <div className="space-y-2">
                                {recentTrades.map((trade, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`text-xs px-2 py-1 rounded-full ${
                                                trade.type === 'Long' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                                            }`}>
                                                {trade.type}
                                            </div>
                                            <span className="text-white font-medium">{trade.symbol}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                                            </span>
                                            <span className="text-white/50 text-sm">{trade.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}; 