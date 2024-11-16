import { FC, useState } from 'react';
import { TradingViewChart } from './TradingViewChart';
import { FaSearch, FaHistory } from 'react-icons/fa';

interface ChartViewerProps {
  onShare?: (symbol: string) => void;
}

export const ChartViewer: FC<ChartViewerProps> = ({ onShare }) => {
  const [symbol, setSymbol] = useState('NASDAQ:AAPL');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    if (!recentSymbols.includes(newSymbol)) {
      setRecentSymbols(prev => [newSymbol, ...prev].slice(0, 5));
    }
    setSearchInput('');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-white font-semibold">Chart Viewer</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search symbol..."
              className="bg-gray-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => handleSymbolChange(searchInput)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {recentSymbols.length > 0 && (
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
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onShare={onShare ? () => onShare(symbol) : undefined}
      />
    </div>
  );
}; 