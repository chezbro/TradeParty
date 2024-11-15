export interface Trade {
    id: string;
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: number;
    currentPrice: number;
    profitLoss: number;
    timestamp: string;
    size: number;
} 