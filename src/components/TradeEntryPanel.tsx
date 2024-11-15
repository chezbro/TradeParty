import { useState } from 'react';
import { FaChartLine, FaDollarSign, FaTimes } from 'react-icons/fa';
import { useTrades } from '@/context/TradesContext';
import { useUser } from '@clerk/nextjs';
import { Trade } from '@/types/trade';

interface TradeEntry {
    symbol: string;
    type: 'LONG' | 'SHORT';
    entry: number;
    target: number;
    stopLoss: number;
    leverage: number;
    margin: number;
    liquidationPrice: number;
    notes: string;
}

interface TradeEntryPanelProps {
    onNewTrade: (trade: Trade) => void;
}

export const TradeEntryPanel: FC<TradeEntryPanelProps> = ({ onNewTrade }) => {
    const { addTrade } = useTrades();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [tradeEntry, setTradeEntry] = useState<TradeEntry>({
        symbol: '',
        type: 'LONG',
        entry: 0,
        target: 0,
        stopLoss: 0,
        leverage: 1,
        margin: 0,
        liquidationPrice: 0,
        notes: ''
    });

    const calculateLiquidationPrice = () => {
        // Add your liquidation price calculation logic here
        // This is a simplified example
        if (tradeEntry.type === 'LONG') {
            return tradeEntry.entry * (1 - 1/tradeEntry.leverage);
        } else {
            return tradeEntry.entry * (1 + 1/tradeEntry.leverage);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new trade object that matches the Trade interface
        const newTrade: Trade = {
            id: Date.now().toString(),
            symbol: tradeEntry.symbol,
            direction: tradeEntry.type.toLowerCase() as 'long' | 'short',
            entryPrice: tradeEntry.entry,
            currentPrice: tradeEntry.entry, // Initially same as entry
            profitLoss: 0, // Initially 0
            timestamp: new Date().toISOString(),
            size: tradeEntry.margin * tradeEntry.leverage
        };
        
        // Call the onNewTrade callback
        onNewTrade(newTrade);
        
        // Also add to context if needed
        addTrade({
            traderId: user?.id || '',
            traderName: user?.fullName || 'Anonymous',
            symbol: tradeEntry.symbol,
            type: tradeEntry.type === 'LONG' ? 'BUY' : 'SELL',
            entry: tradeEntry.entry,
            target: tradeEntry.target,
            stopLoss: tradeEntry.stopLoss,
            leverage: tradeEntry.leverage,
            margin: tradeEntry.margin,
            notes: tradeEntry.notes
        });

        // Reset form
        setTradeEntry({
            symbol: '',
            type: 'LONG',
            entry: 0,
            target: 0,
            stopLoss: 0,
            leverage: 1,
            margin: 0,
            liquidationPrice: 0,
            notes: ''
        });
        
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-8 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all z-50"
            >
                <FaChartLine size={24} />
            </button>

            {/* Trade Entry Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                                    <FaDollarSign className="text-green-400" />
                                    New Trade Entry
                                </h2>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Symbol Input */}
                                    <div>
                                        <label className="block text-gray-300 mb-2">Symbol</label>
                                        <input
                                            type="text"
                                            value={tradeEntry.symbol}
                                            onChange={(e) => setTradeEntry({...tradeEntry, symbol: e.target.value.toUpperCase()})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="BTC/USD"
                                            required
                                        />
                                    </div>

                                    {/* Trade Type Selection */}
                                    <div>
                                        <label className="block text-gray-300 mb-2">Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setTradeEntry({...tradeEntry, type: 'LONG'})}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    tradeEntry.type === 'LONG'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                LONG
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTradeEntry({...tradeEntry, type: 'SHORT'})}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    tradeEntry.type === 'SHORT'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                SHORT
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Inputs */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">Entry Price</label>
                                        <input
                                            type="number"
                                            value={tradeEntry.entry || ''}
                                            onChange={(e) => setTradeEntry({...tradeEntry, entry: parseFloat(e.target.value)})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">Target Price</label>
                                        <input
                                            type="number"
                                            value={tradeEntry.target || ''}
                                            onChange={(e) => setTradeEntry({...tradeEntry, target: parseFloat(e.target.value)})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">Stop Loss</label>
                                        <input
                                            type="number"
                                            value={tradeEntry.stopLoss || ''}
                                            onChange={(e) => setTradeEntry({...tradeEntry, stopLoss: parseFloat(e.target.value)})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Position Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">Leverage</label>
                                        <input
                                            type="number"
                                            value={tradeEntry.leverage || ''}
                                            onChange={(e) => setTradeEntry({...tradeEntry, leverage: parseFloat(e.target.value)})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="1x"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">Margin</label>
                                        <input
                                            type="number"
                                            value={tradeEntry.margin || ''}
                                            onChange={(e) => setTradeEntry({...tradeEntry, margin: parseFloat(e.target.value)})}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-gray-300 mb-2">Notes</label>
                                    <textarea
                                        value={tradeEntry.notes}
                                        onChange={(e) => setTradeEntry({...tradeEntry, notes: e.target.value})}
                                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-24 resize-none"
                                        placeholder="Add your trade notes here..."
                                    />
                                </div>

                                {/* Liquidation Price Display */}
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Estimated Liquidation Price:</span>
                                        <span className="text-red-400 font-semibold">
                                            ${calculateLiquidationPrice().toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors"
                                >
                                    Place Trade
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}; 