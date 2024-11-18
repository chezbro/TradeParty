import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { TradingViewChart } from './TradingViewChart';
import { FaSearch, FaHistory, FaStar, FaChartLine, FaShare, FaExpand, FaCompress } from 'react-icons/fa';
import { useCall } from "@stream-io/video-react-sdk";

interface ChartViewerProps {
  onShare: (symbol: string) => void;
  onSymbolChange: (symbol: string) => void;
  symbol: string;
  onToggleFavorite?: (symbol: string) => void;
  isFavorited?: boolean;
  compact?: boolean;
  onToggleMultiChart?: () => void;
  isMultiChartEnabled?: boolean;
  isAddChart?: boolean;
  isLiveSharing?: boolean;
  onToggleLiveShare?: () => void;
  isReadOnly?: boolean;
}

// Cryptocurrency trading pairs (with USDT)
const CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT',
  'SOLUSDT', 'DOTUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT',
  'ETCUSDT', 'ALGOUSDT', 'NEARUSDT', 'ICPUSDT', 'FILUSDT', 'AAVEUSDT', 'AXSUSDT',
  'SANDUSDT', 'MANAUSDT', 'SHIBUSDT', 'GALAUSDT', 'APEUSDT', 'GMTUSDT', 'OPUSDT'
];

// Stock symbols
const STOCK_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'IBM',
  'NFLX', 'DIS', 'PYPL', 'ADBE', 'CSCO', 'ORCL', 'CRM', 'QCOM', 'TXN', 'AVGO'
];

interface SymbolOption {
  symbol: string;
  type: 'crypto' | 'stock';
  name?: string;
}

// Combine both types with metadata
const ALL_SYMBOLS: SymbolOption[] = [
  ...CRYPTO_SYMBOLS.map(symbol => ({
    symbol,
    type: 'crypto' as const,
    name: `${symbol.replace('USDT', '')} / USDT`
  })),
  ...STOCK_SYMBOLS.map(symbol => ({
    symbol,
    type: 'stock' as const
  }))
];

export const ChartViewer: FC<ChartViewerProps> = ({ 
  onShare, 
  onSymbolChange,
  symbol,
  onToggleFavorite,
  isFavorited,
  compact = false,
  onToggleMultiChart,
  isMultiChartEnabled,
  isAddChart,
  isLiveSharing = false,
  onToggleLiveShare,
  isReadOnly = false,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const call = useCall();

  // Memoize callbacks that are passed to TradingViewChart
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(symbol);
    }
  }, [onShare, symbol]);

  const handleToggleLiveShare = useCallback(() => {
    if (onToggleLiveShare) {
      onToggleLiveShare();
      
      // Send custom event through Stream Video
      if (call) {
        call.sendCustomEvent({
          type: isLiveSharing ? 'stop_chart_share' : 'start_chart_share',
          data: {
            symbol,
            sharedBy: call.state.localParticipant?.userId
          }
        });
      }
    }
  }, [onToggleLiveShare, isLiveSharing, call, symbol]);

  // Updated filter function to handle the new structure
  const filteredSymbols = ALL_SYMBOLS.filter(sym => 
    sym.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
    sym.name?.toLowerCase().includes(searchInput.toLowerCase())
  ).slice(0, 8); // Show more results

  const handleSymbolChange = (newSymbol: string) => {
    if (isReadOnly) {
      console.log("Chart is in read-only mode, ignoring symbol change");
      return;
    }
    
    onSymbolChange(newSymbol);
    if (!recentSymbols.includes(newSymbol)) {
      setRecentSymbols(prev => [newSymbol, ...prev].slice(0, 5));
    }
    setSearchInput('');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
      {!isReadOnly && (
        <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
          <div className="flex items-center gap-3">
            <h2 className={`${compact ? 'text-lg' : 'text-xl'} text-white font-semibold`}>
              {symbol}
            </h2>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(symbol)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <FaStar 
                  size={compact ? 16 : 20} 
                  className={isFavorited ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"} 
                />
              </button>
            )}
          </div>
          
          {!compact && (
            <div className="flex gap-4 items-center">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search symbol..."
                  className="bg-gray-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                
                {/* Updated Dropdown Menu */}
                {showDropdown && searchInput && (
                  <div className="absolute mt-1 w-full bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden z-50">
                    {filteredSymbols.length > 0 ? (
                      filteredSymbols.map((sym) => (
                        <button
                          key={sym.symbol}
                          onClick={() => handleSymbolChange(sym.symbol)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-0.5 rounded ${
                              sym.type === 'crypto' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {sym.type.toUpperCase()}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{sym.symbol}</span>
                              {sym.name && (
                                <span className="text-xs text-gray-400 group-hover:text-gray-300">
                                  {sym.name}
                                </span>
                              )}
                            </div>
                          </div>
                          {recentSymbols.includes(sym.symbol) && (
                            <FaHistory className="text-gray-400" size={12} />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-400">No results found</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Add Multi-Chart Toggle Button */}
              {onToggleMultiChart && (
                <button
                  onClick={onToggleMultiChart}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                    border transition-colors ${
                      isMultiChartEnabled
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                >
                  <FaChartLine size={16} />
                  <span className="text-sm">{isMultiChartEnabled ? 'Single View' : 'Multi View'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!compact && recentSymbols.length > 0 && (
        <div className="flex gap-2 mb-4 items-center">
          <FaHistory className="text-gray-400" />
          {recentSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => handleSymbolChange(sym)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg transition-colors"
            >
              {sym}
            </button>
          ))}
        </div>
      )}

      <TradingViewChart
        symbol={symbol}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onShare={handleShare}
        compact={compact}
        isReadOnly={isReadOnly}
      />

      {!isReadOnly && (
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {typeof onShare === 'function' && (
          <button
            onClick={handleShare}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <FaShare size={16} />
          </button>
        )}
        
        {/* Add Live Share button */}
        {onToggleLiveShare && (
          <button
            onClick={handleToggleLiveShare}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2
              ${isLiveSharing 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
          >
            <div className="flex items-center gap-1.5">
              {isLiveSharing && (
                <span className="animate-pulse text-[8px]">●</span>
              )}
              <span className="text-sm">
                {isLiveSharing ? 'Stop Sharing' : 'Share Live'}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={handleToggleFullscreen}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
        </button>
      </div>
      )}
    </div>
  );
}; 