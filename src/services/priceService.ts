export const startPriceUpdates = (
    symbols: string[],
    onUpdate: (prices: Record<string, number>) => void
) => {
    // Initialize prices if not already set
    symbols.forEach(symbol => {
        if (!localStorage.getItem(`price_${symbol}`)) {
            // Set initial price (for demo purposes)
            const initialPrice = 100 + Math.random() * 900;
            localStorage.setItem(`price_${symbol}`, initialPrice.toString());
        }
    });

    const interval = setInterval(() => {
        const updates: Record<string, number> = {};
        symbols.forEach(symbol => {
            const currentPrice = parseFloat(localStorage.getItem(`price_${symbol}`) || "0");
            const change = (Math.random() - 0.5) * 2; // Random price movement
            const newPrice = Math.max(0.01, currentPrice + change);
            localStorage.setItem(`price_${symbol}`, newPrice.toString());
            updates[symbol] = newPrice;
        });
        onUpdate(updates);
    }, 5000);

    return () => clearInterval(interval);
}; 