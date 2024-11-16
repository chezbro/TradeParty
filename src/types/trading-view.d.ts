interface ChartMetadata {
  id: string;
  name: string;
  symbol: string;
  timestamp: number;
  content: any;
}

interface SaveLoadAdapter {
  getAllCharts: () => Promise<ChartMetadata[]>;
  removeChart: (id: string) => Promise<void>;
  saveChart: (chartData: any) => Promise<string>;
  loadChart: (id: string) => Promise<any>;
  getChartContent: () => Promise<any>;
}

interface TradingViewWidget {
  widget: (config: {
    autosize?: boolean;
    symbol?: string;
    interval?: string;
    timezone?: string;
    theme?: string;
    style?: string;
    locale?: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    hide_side_toolbar?: boolean;
    allow_symbol_change?: boolean;
    container_id: string;
    // Storage configuration
    charts_storage_url: string;
    charts_storage_api_version: string;
    client_id: string;
    user_id: string;
    drawings_access?: {
      type: 'localStorage';
      tools: Array<{
        name: string;
        grayed: boolean;
      }>;
    };
  }) => void;
}

declare global {
  interface Window {
    TradingView: TradingViewWidget;
  }
}

export {}; 