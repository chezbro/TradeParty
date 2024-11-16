export interface Trade {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entry: number;
    target: number;
    stopLoss: number;
    size: number;
    timestamp: number;
    status: 'OPEN' | 'CLOSED';
    profitLoss: number;
    currentPrice: number;
} 