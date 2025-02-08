import { FC, useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { TradingViewChart } from './TradingViewChart';
import { FaSearch, FaHistory, FaStar, FaChartLine, FaShare, FaExpand, FaCompress } from 'react-icons/fa';
import { useCall } from "@stream-io/video-react-sdk";
import { debounce } from '@/utils/debounce';
import { searchDexScreener } from '@/utils/dexscreener';
import { useSupabaseUser, User } from '@/app/hooks/useSupabaseUser';

interface ChartViewerProps {
  onShare: (symbol: string) => void;
  onSymbolChange: (symbol: string, dexData?: {
    type: 'dex',
    chainId: string,
    pairAddress: string
  }) => void;
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
  onAddChart?: (symbol: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  sharingPermissions?: string[];
}

// Cryptocurrency trading pairs (with USDT)
const CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT',
  'SOLUSDT', 'DOTUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT',
  'ETCUSDT', 'ALGOUSDT', 'NEARUSDT', 'ICPUSDT', 'FILUSDT', 'AAVEUSDT', 'AXSUSDT',
  'SANDUSDT', 'MANAUSDT', 'SHIBUSDT', 'GALAUSDT', 'APEUSDT', 'GMTUSDT', 'OPUSDT',
  'LUNAUSDT', 'FTMUSDT', 'KSMUSDT', 'ZRXUSDT', 'FETUSDT', 'STMXUSDT', 'TLMUSDT',
  'BTTUSDT', 'TRXUSDT', 'CELOUSDT', 'MKRUSDT', 'DASHUSDT', 'ZECUSDT', 'XLMUSDT',
  'RENUSDT', 'QKCUSDT', 'VETUSDT', 'SUSHIUSDT', 'CHZUSDT', 'CROUSDT', 'CRVUSDT',
  '1INCHUSDT', 'RUNEUSDT', 'MITHUSDT', 'KEEPUSDT', 'LENDUSDT', 'FLUXUSDT', 'C98USDT',
  'PERLUSDT', 'STPTUSDT', 'LRCUSDT', 'SKLUSDT', 'HNTUSDT', 'HBARUSDT', 'OCEANUSDT',
  'GRTUSDT', 'EGLDUSDT', 'STMXUSDT', 'OXTUSDT', 'KAVAUSDT', 'TWTUSDT', 'SFPUSDT',
  'LOKAUSDT', 'FETUSDT', 'HFTUSDT', 'WAVESUSDT', 'XEMUSDT', 'KLAYUSDT', 'TROYUSDT',
  'YFIUSDT', 'SANDUSDT', 'WOOUSDT', 'TWTUSDT', 'STMXUSDT', 'JUNOUSDT', 'STPTUSDT',
  'PERLUSDT', 'FTTUSDT', 'ZRXUSDT', 'BANDUSDT', 'TRBUSDT', 'HUSDUSDT', 'TITAUSDT',
  'CSPRUSDT', 'KNCUSDT', 'RSRUSDT', 'LENDUSDT', 'SUSHIUSDT', 'CRVUSDT', 'DOGEUSDT',
  'CELRUSDT', 'STMXUSDT', 'LENDUSDT', 'AAVEUSDT', 'STPTUSDT', 'SOLUSDT', 'DOGEUSDT',
  'ZRXUSDT', 'MATICUSDT', 'UNFIUSDT', 'NEXOESDT', 'RUNEUSDT', 'SUSHIUSDT', 'SANDUSDT',
  'FTMUSDT', 'DYDXUSDT', 'NEARUSDT', 'QTUMUSDT', 'HNTUSDT', 'SANDUSDT', 'XLMUSDT',
  'IMXUSDT', 'SUSHIUSDT', 'WOOUSDT', 'COTIUSDT', 'STPTUSDT', 'TLMUSDT', 'AAVEUSDT',
  'SHIBUSDT', 'CROUSDT', 'XRPUSDT', 'ZRXUSDT', 'SOLUSDT', 'ADAUSDT', 'LTCUSDT', 'MATICUSDT',
  'BANDUSDT', 'CELOUSDT', 'MKRUSDT', 'GALAUSDT', 'GMTUSDT', 'KAVAUSDT', 'C98USDT', 'TWTUSDT',
  'KLAYUSDT', 'VETUSDT', 'FTMUSDT', 'RENUSDT', 'SANDUSDT', 'GRTUSDT', 'WAVESUSDT', 'ZRXUSDT'
];


// Stock symbols
const STOCK_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'IBM',
  'NFLX', 'DIS', 'PYPL', 'ADBE', 'CSCO', 'ORCL', 'CRM', 'QCOM', 'TXN', 'AVGO',
  'BA', 'SPY', 'NVDA', 'INTU', 'MU', 'V', 'WMT', 'KO', 'PFE', 'NKE', 'GS', 'CAT',
  'MCD', 'ABT', 'CVX', 'JNJ', 'VZ', 'MS', 'BABA', 'LUV', 'UPS', 'XOM', 'AMGN',
  'HSBC', 'C', 'GM', 'F', 'ZTS', 'HON', 'PYPL', 'T', 'MA', 'WFC', 'LOW', 'UNH',
  'V', 'SLB', 'CSX', 'LMT', 'BA', 'EXC', 'GD', 'BBY', 'RTX', 'SQ', 'DELL', 'GS',
  'TGT', 'AIG', 'BKNG', 'TWTR', 'DISCA', 'LUV', 'CSCO', 'BNTX', 'MNST', 'ILMN',
  'MSCI', 'DHR', 'SYK', 'MDT', 'CSX', 'SPG', 'USB', 'CVS', 'GS', 'HCA', 'SYF', 'STZ',
  'ACN', 'ZM', 'NFLX', 'SQ', 'BA', 'ATVI', 'AMAT', 'WBA', 'PFE', 'V', 'MA', 'SBUX',
  'HCA', 'ANTM', 'KO', 'TRV', 'MSFT', 'VLO', 'MPC', 'PGR', 'SPG', 'CL', 'AIG', 'UPS',
  'BAX', 'SYY', 'FIS', 'MO', 'BMY', 'AON', 'RSG', 'ROST', 'BURL', 'TROW', 'WDC',
  'CSX', 'TSCO', 'IAC', 'REGN', 'DLR', 'FISV', 'EL', 'CTSH', 'JPM', 'AXP', 'PGR',
  'FLIR', 'FMC', 'HSY', 'KLAC', 'CME', 'MCO', 'COF', 'BK', 'TFC', 'FAST', 'TAP',
  'DRI', 'DHR', 'ICE', 'LLY', 'NUE', 'RTX', 'UPS', 'CHTR', 'PH', 'SCHW', 'RMD',
  'TROW', 'SYF', 'COP', 'BIDU', 'LULU', 'CCL', 'APA', 'VRTX', 'KLAC', 'ILMN',
  'MCHP', 'MTCH', 'CVX', 'SWKS', 'ALB', 'TT', 'SIRI', 'VLO', 'EXC', 'ADM', 'FTNT',
  'IDXX', 'NRG', 'SYK', 'MELI', 'AVY', 'VZ', 'NSC', 'FISV', 'PDD', 'AZN', 'IQ',
  'BAX', 'WFC', 'ALL', 'FIS', 'SIVB', 'NXPI', 'REGN', 'RMD', 'GOOG', 'GS', 'TGT',
  'ORCL', 'DIS', 'NFLX', 'CVX', 'MA', 'WBA', 'QCOM', 'VZ', 'LUV', 'F', 'MS', 'T', 'BA'
];


interface DexScreenerSymbol {
  symbol: string;
  type: 'dex';
  name: string;
  chainId: string;
  pairAddress: string;
}

interface SymbolOption {
  symbol: string;
  type: 'crypto' | 'stock' | 'dex';
  name?: string;
  chainId?: string;
  pairAddress?: string;
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

// Add this interface to track DEX data
interface DexData {
  type: 'dex';
  chainId: string;
  pairAddress: string;
}

export const ChartViewer: FC<ChartViewerProps> = memo(({ 
  onShare, 
  onSymbolChange,
  symbol,
  onToggleFavorite,
  isFavorited,
  compact = false,
  onToggleMultiChart,
  isMultiChartEnabled,
  isAddChart = false,
  isLiveSharing = false,
  onToggleLiveShare,
  isReadOnly = false,
  onAddChart,
  onFullscreenChange,
  sharingPermissions = [],
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const call = useCall();
  const [dexResults, setDexResults] = useState<DexScreenerSymbol[]>([]);
  const [tradingViewResults, setTradingViewResults] = useState<SymbolOption[]>([]);
  const [currentDexData, setCurrentDexData] = useState<DexData | undefined>(undefined);
  const { user } = useSupabaseUser();
  const canShare = sharingPermissions.includes(user?.id || '');
  const isHost = call?.state.createdBy?.id === user?.id;

  // Update the live sharing button visibility
  const showLiveShareButton = isHost || canShare;

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
    if (!call || !onToggleLiveShare) return;
    onToggleLiveShare();
  }, [call, onToggleLiveShare]);

  // Update the filter function to use memoized results
  const filteredSymbols = useMemo(() => {
    const tvResults = searchInput ? tradingViewResults : [];
    return [...tvResults, ...dexResults].slice(0, 8);
  }, [tradingViewResults, dexResults, searchInput]);

  const handleSymbolChange = useCallback((newSymbol: string, newSymbolData?: SymbolOption) => {
    if (isReadOnly) {
      console.log("Chart is in read-only mode, ignoring symbol change");
      return;
    }
    
    if (isAddChart && onAddChart) {
      onAddChart(newSymbol);
      setSearchInput('');
      setShowDropdown(false);
      return;
    }

    // Update DEX data when symbol changes
    if (newSymbolData?.type === 'dex') {
      setCurrentDexData({
        type: 'dex',
        chainId: newSymbolData.chainId!,
        pairAddress: newSymbolData.pairAddress!
      });
    } else {
      setCurrentDexData(undefined);
    }

    // If we're live sharing, broadcast the symbol change
    if (isLiveSharing && call) {
      console.log('Broadcasting symbol change:', { newSymbol });
      call.sendCustomEvent({
        type: 'chart_update',
        data: {
          symbol: newSymbol,
          userId: call.state.localParticipant?.userId,
          userName: call.state.localParticipant?.name || 'Anonymous'
        }
      });
    }

    onSymbolChange(newSymbol, newSymbolData?.type === 'dex' ? {
      type: 'dex',
      chainId: newSymbolData.chainId!,
      pairAddress: newSymbolData.pairAddress!
    } : undefined);
    
    setRecentSymbols(prev => {
      if (!prev.includes(newSymbol)) {
        return [newSymbol, ...prev].slice(0, 5);
      }
      return prev;
    });
    setSearchInput('');
    setShowDropdown(false);
  }, [isReadOnly, isAddChart, onAddChart, onSymbolChange, isLiveSharing, call]);

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

  // Update the search implementation
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setDexResults([]);
      setTradingViewResults([]);
      return;
    }

    // Filter TradingView symbols
    const tvResults = ALL_SYMBOLS.filter(sym => 
      sym.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sym.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTradingViewResults(tvResults);

    // Search DEXScreener
    try {
      const dexResults = await searchDexScreener(searchTerm);
      setDexResults(dexResults);
    } catch (error) {
      console.error('Error searching DEXScreener:', error);
      setDexResults([]);
    }
  }, []);

  // Debounce the search
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  // Effect to trigger search when input changes
  useEffect(() => {
    if (searchInput) {
      debouncedSearch(searchInput);
    } else {
      setDexResults([]);
      setTradingViewResults([]);
    }
  }, [searchInput, debouncedSearch]);

  const handleFullscreenChange = useCallback((isFullscreen: boolean) => {
    setIsFullscreen(isFullscreen);
    onFullscreenChange?.(isFullscreen);
  }, [onFullscreenChange]);

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
      {!isReadOnly && (
        <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
          <div className="flex items-center gap-3">
            {isAddChart ? (
              <h2 className={`${compact ? 'text-lg' : 'text-xl'} text-white font-semibold`}>
                Add Chart
              </h2>
            ) : (
              <>
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
              </>
            )}
          </div>
          
          {/* Search Input - Always show for Add Chart mode */}
          {(!compact || isAddChart) && (
            <div className="flex gap-3 items-center">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={isAddChart ? "Search for symbol to add..." : "Search symbol..."}
                  className="bg-gray-700 text-white rounded-lg px-4 py-2 pl-14 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
        
                
                {/* Dropdown Menu */}
                {showDropdown && searchInput && (
                  <div className="absolute mt-1 w-full bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden z-50">
                    {filteredSymbols.length > 0 ? (
                      filteredSymbols.map((sym) => (
                        <button
                          key={`${sym.type}-${sym.symbol}-${sym.chainId || ''}`}
                          onClick={() => handleSymbolChange(sym.symbol, sym)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-0.5 rounded ${
                              sym.type === 'crypto' 
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : sym.type === 'stock'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {sym.type === 'dex' ? 'DEX' : sym.type.toUpperCase()}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{sym.symbol}</span>
                              {sym.name && (
                                <span className="text-xs text-gray-400 group-hover:text-gray-300">
                                  {sym.name}
                                  {sym.type === 'dex' && ` (${sym.chainId})`}
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

              {/* Only show these buttons when not in Add Chart mode */}
              {!isAddChart && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Live Share Button */}
                  {showLiveShareButton && onToggleLiveShare && (
                    <button
                      onClick={handleToggleLiveShare}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg
                        border transition-colors ${
                          isLiveSharing
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        }`}
                    >
                      <span className={`${isLiveSharing ? 'animate-pulse' : ''} text-[6px] sm:text-[8px]`}>●</span>
                      <span className="text-xs sm:text-sm whitespace-nowrap">Share Chart Live</span>
                    </button>
                  )}
                  
                  {/* Multi-Chart Toggle Button */}
                  {onToggleMultiChart && (
                    <button
                      onClick={onToggleMultiChart}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg
                        border transition-colors ${
                          isMultiChartEnabled
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                        }`}
                    >
                      <FaChartLine size={14} className="sm:text-base" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">{isMultiChartEnabled ? 'Single View' : 'Multi View'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Only show recent symbols and chart when not in Add Chart mode */}
      {!isAddChart && (
        <>
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
            chartType={symbol.includes('/') ? 'dexscreener' : 'tradingview'}
            dexData={currentDexData}
            onFullscreenChange={handleFullscreenChange}
          />
        </>
      )}

      {/* Show message when someone else is sharing */}
      {isLiveSharing && !canShare && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 
          bg-gray-900/90 px-3 py-2 rounded-full border border-emerald-500/20">
          <span className="animate-pulse text-emerald-400 text-[8px]">●</span>
          <span className="text-sm text-white/90">
            Viewing Shared Chart
          </span>
        </div>
      )}
    </div>
  );
});

ChartViewer.displayName = 'ChartViewer'; 