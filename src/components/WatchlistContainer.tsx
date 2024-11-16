import { useState } from 'react';
import { FaStar, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface WatchlistContainerProps {
    watchlist: string[];
    onSymbolSelect: (symbol: string) => void;
    onStarClick: (symbol: string) => void;
}

export const WatchlistContainer = ({ watchlist, onSymbolSelect, onStarClick }: WatchlistContainerProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-t-xl"
                >
                    <h2 className="text-xl text-white font-semibold flex items-center gap-2">
                        <FaStar className="text-yellow-400" />
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
                    <div className="p-4 pt-0">
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