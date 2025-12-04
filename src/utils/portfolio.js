export const calculateHoldings = (entries) => {
    // Sort by date ascending to process chronologically
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    const holdingsMap = {};

    sortedEntries.forEach(entry => {
        // Use symbol if available, otherwise fallback to ticker (for old data)
        const key = entry.symbol || entry.ticker;

        if (!holdingsMap[key]) {
            holdingsMap[key] = {
                quantity: 0,
                totalCost: 0,
                avgPrice: 0,
                name: entry.name || entry.ticker, // Store name
                symbol: entry.symbol || entry.ticker // Store symbol
            };
        }

        const current = holdingsMap[key];
        const price = parseInt(entry.price);
        const quantity = parseInt(entry.quantity);

        if (entry.type === 'buy') {
            current.totalCost += price * quantity;
            current.quantity += quantity;
            current.avgPrice = current.quantity > 0 ? Math.round(current.totalCost / current.quantity) : 0;
        } else if (entry.type === 'sell') {
            // Sell reduces quantity, but avgPrice remains the same (FIFO/Weighted Avg standard behavior for simple tracking)
            // We reduce totalCost proportionally to keep avgPrice constant
            current.quantity -= quantity;
            current.totalCost = current.quantity * current.avgPrice;
        }

        // Clean up if quantity is 0 or less
        if (current.quantity <= 0) {
            delete holdingsMap[key];
        }
    });

    return Object.entries(holdingsMap).map(([key, data]) => ({
        ticker: key, // Keep ticker for backward compatibility
        ...data
    }));
};
