import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';

interface MarketOverview {
  sentimentScore: number;
  bullishPct: number;
  bearishPct: number;
  fearGreed: number;
  tickers: any[];
  lastUpdated: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const cacheKey = 'market_overview_v1';
    
    // Check cache first
    const { data: cached } = await supabase
      .from('market_cache')
      .select('data, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch fresh data
    const watchlistTickers = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'PLTR', 'COIN'];
    const tickerString = watchlistTickers.join(',');
    
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${tickerString}?apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('FMP API request failed');
    }

    const quotes = await response.json();

    // Calculate sentiment
    let bullishCount = 0;
    let bearishCount = 0;
    let totalChange = 0;

    quotes.forEach((quote: any) => {
      if (quote.changesPercentage > 0) bullishCount++;
      else if (quote.changesPercentage < 0) bearishCount++;
      totalChange += quote.changesPercentage;
    });

    const total = quotes.length;
    const bullishPct = bullishCount / total;
    const bearishPct = bearishCount / total;
    const avgChange = totalChange / total;

    // Sentiment score: 0-100 scale
    const sentimentScore = Math.round(50 + (avgChange * 5) + ((bullishCount - bearishCount) * 2));
    const clampedSentiment = Math.max(0, Math.min(100, sentimentScore));

    // Fear & Greed approximation
    const fearGreed = Math.round(50 + (bullishPct - bearishPct) * 50);

    const overview: MarketOverview = {
      sentimentScore: clampedSentiment,
      bullishPct: Math.round(bullishPct * 100) / 100,
      bearishPct: Math.round(bearishPct * 100) / 100,
      fearGreed: Math.max(0, Math.min(100, fearGreed)),
      tickers: quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.name,
        price: q.price,
        change: q.change,
        changesPercentage: q.changesPercentage,
        marketCap: q.marketCap,
        volume: q.volume,
      })),
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    await supabase
      .from('market_cache')
      .upsert({
        cache_key: cacheKey,
        data: overview,
        expires_at: expiresAt,
      });

    return new Response(JSON.stringify(overview), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Market overview error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});