import React, { useState } from 'react';
import { Trade } from '@/types/trade';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { TradeEntryPanel } from './TradeEntryPanel';

interface TradeEntryContainerProps {
    onNewTrade: (trade: Trade) => void;
    currentSymbol?: string;
}

export const TradeEntryContainer: React.FC<TradeEntryContainerProps> = ({ 
    onNewTrade, 
    currentSymbol 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-lg bg-gray-900/50 border border-white/10 overflow-hidden">
            {/* Header */}
            <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-white/90 font-medium">Enter Trade</span>     
                </div>
                <button className="text-white/50 hover:text-white/90 transition-colors">
                    {isExpanded ? <FaChevronDown size={16} /> : <FaChevronRight size={16} />}
                </button>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 border-t border-white/5">
                    <TradeEntryPanel 
                        key={currentSymbol}
                        onNewTrade={onNewTrade}
                        currentSymbol={currentSymbol}
                    />
                </div>
            )}
        </div>
    );
}; 