import { useState } from 'react';
import { FaStar, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface WatchlistContainerProps {
    watchlist: string[];
    onSymbolSelect: (symbol: string) => void;
    onStarClick: (symbol: string) => Promise<void>;
    isLoading?: boolean;
}

export const WatchlistContainer = ({ 
    watchlist, 
    onSymbolSelect, 
    onStarClick,
    isLoading = false
}: WatchlistContainerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-4">
            <div className="bg-gray-900/50 border border-white/10 rounded-lg overflow-hidden">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <h2 className="text-xl text-white font-semibold flex items-center gap-3">
                        <FaStar className="text-gray-400" />
                        Watchlist
                    </h2>
                    {isExpanded ? (
                        <FaChevronDown className="text-gray-400" />
                    ) : (
                        <FaChevronRight className="text-gray-400" />
                    )}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="p-4 border-t border-white/5">
                        <div className="flex flex-col gap-3">
                            {watchlist.map((symbol) => (
                                <div 
                                    key={symbol}
                                    className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer text-gray-200"
                                    onClick={() => onSymbolSelect(symbol)}
                                >
                                    <span>{symbol}</span>
                                    <FaStar 
                                        size={20}
                                        className="text-yellow-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStarClick(symbol);
                                        }}
                                    />
                                </div>
                            ))}
                            {watchlist.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    No starred symbols yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 