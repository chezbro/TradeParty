import { FC, useEffect, useRef, useState } from 'react';
import { FaExpand, FaCompress, FaShare } from 'react-icons/fa';
import { FaGripLines } from 'react-icons/fa6';

interface TradingViewChartProps {
  symbol: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onShare?: () => void;
  compact?: boolean;
}

export const TradingViewChart: FC<TradingViewChartProps> = ({
  symbol,
  isFullscreen,
  onToggleFullscreen,
  onShare,
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [height, setHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  
  const chartId = useRef(`tradingview_chart_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = Math.max(200, Math.min(1000, e.clientY - containerRect.top));
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof TradingView !== 'undefined') {
        const widget = new TradingView.widget({
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
          container_id: chartId.current,
          
          charts_storage_url: "https://saveload.tradingview.com",
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          
          drawings_access: { 
            type: "localStorage", 
            tools: [{ name: "all", grayed: false }] 
          }
        });

        widgetRef.current = widget;
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
      widgetRef.current = null;
    };
  }, [symbol]);

  return (
    <div 
      ref={containerRef}
      style={{ height: isFullscreen ? '100%' : `${height}px` }}
      className={`relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700
        ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
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
        id={chartId.current}
        className={`w-full h-full ${compact ? 'min-h-[300px]' : 'min-h-[400px]'}`}
      />
      
      {!isFullscreen && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center cursor-ns-resize hover:bg-gray-800/50 transition-colors"
          onMouseDown={() => setIsDragging(true)}
        >
          <FaGripLines className="text-gray-400" />
        </div>
      )}
    </div>
  );
}; 