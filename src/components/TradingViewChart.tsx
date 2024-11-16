import { FC, useEffect, useRef } from 'react';
import { FaExpand, FaCompress, FaShare } from 'react-icons/fa';

interface TradingViewChartProps {
  symbol: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onShare?: () => void;
}

export const TradingViewChart: FC<TradingViewChartProps> = ({
  symbol,
  isFullscreen,
  onToggleFullscreen,
  onShare
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined') {
        new TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart"
        });
      }
    };
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        const scriptElement = containerRef.current.querySelector('script');
        if (scriptElement) {
          scriptElement.remove();
        }
      }
    };
  }, [symbol]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700
      ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[400px]'}`}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <FaShare size={16} />
          </button>
        )}
        <button
          onClick={onToggleFullscreen}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
        >
          {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
        </button>
      </div>
      <div 
        ref={containerRef}
        id="tradingview_chart"
        className="w-full h-full"
      />
    </div>
  );
}; 