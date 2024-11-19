interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  baseToken: {
    symbol: string;
    name: string;
  };
  quoteToken: {
    symbol: string;
  };
}

interface DexScreenerSearchResponse {
  pairs: DexScreenerPair[];
}

export async function searchDexScreener(query: string) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${query}`);
    const data: DexScreenerSearchResponse = await response.json();
    
    return data.pairs.map(pair => ({
      symbol: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
      type: 'dex' as const,
      name: pair.baseToken.name,
      chainId: pair.chainId,
      pairAddress: pair.pairAddress,
    }));
  } catch (error) {
    console.error('Error fetching from DEXScreener:', error);
    return [];
  }
} 