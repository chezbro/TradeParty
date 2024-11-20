export interface Trade {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entry: number;
    target: number;
    stopLoss: number;
    size: number;
    timestamp: string;
    status: 'OPEN' | 'CLOSED';
    exitPrice?: number;
    exitTimestamp?: string;
    profitLoss: number;
    currentPrice: number;
    trader: {
        id: string;
        name: string;
    };
} 