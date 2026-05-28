import { NextResponse } from 'next/server';
import { fetchMarketData } from '@/lib/fetchMarketData';

export async function GET() {
  try {
    const data = await fetchMarketData();
    return NextResponse.json(data);
  } catch (err) {
    console.error('market-data error:', err);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
