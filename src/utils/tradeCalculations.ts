import { Trade } from '@/types/trade';

export const calculateTradePnL = (trade: Trade): number => {
    const multiplier = trade.type === 'LONG' ? 1 : -1;
    const priceChange = (trade.status === 'CLOSED' ? trade.exitPrice! : trade.currentPrice) - trade.entry;
    return multiplier * priceChange * trade.size;
};

export const calculateTraderStats = (trades: Trade[]) => {
    const stats = {
        totalPnL: 0,
        winCount: 0,
        totalTrades: trades.length,
        openPositions: 0,
        winRate: 0
    };

    trades.forEach(trade => {
        const pnl = calculateTradePnL(trade);
        stats.totalPnL += pnl;

        if (trade.status === 'CLOSED') {
            if (pnl > 0) stats.winCount++;
        } else {
            stats.openPositions++;
        }
    });

    const closedTrades = trades.filter(t => t.status === 'CLOSED').length;
    stats.winRate = closedTrades > 0 ? stats.winCount / closedTrades : 0;

    return stats;
}; 