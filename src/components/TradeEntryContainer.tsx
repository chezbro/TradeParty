import React, { useState } from 'react';
import { Trade } from '@/types/trade';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { TradeEntryPanel } from './TradeEntryPanel';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl text-white font-semibold">Enter Trade</span>     
                </div>
                {isExpanded ? (
                    <FaChevronDown className="text-gray-400" />
                ) : (
                    <FaChevronRight className="text-gray-400" />
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 border-t border-white/5">
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