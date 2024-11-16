export interface Trade {
    id: string;
    type: "LONG" | "SHORT";
    symbol: string;
    entry: number;
    target: number;
    stopLoss: number;
    timestamp: number;
    trader: {
        id: string;
        name: string;
    };
} 