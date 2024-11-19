import { NextResponse } from 'next/server';

// Common stock symbols for testing
const SAMPLE_SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'NFLX',
  'DIS', 'COIN', 'GME', 'AMC', 'PLTR', 'NIO', 'BA', 'JPM', 'GS', 'MS',
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toUpperCase() || '';

  if (!query) {
    return NextResponse.json({ symbols: [] });
  }

  // Filter symbols that match the query
  const matchedSymbols = SAMPLE_SYMBOLS.filter(symbol => 
    symbol.toUpperCase().includes(query)
  );

  return NextResponse.json({ symbols: matchedSymbols });
} 