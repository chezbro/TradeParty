export interface Trade {
    id: string;
    symbol: string;
    type: "LONG" | "SHORT";
    entry: number;
    target: number;
    stopLoss: number;
    timestamp: string;
    status: "OPEN" | "CLOSED";
    profitLoss: number;
    pnl?: number;
} 