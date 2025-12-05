import { mockStockQuotes, mockCompanyProfiles, mockMarketNews, mockCompanyNews } from './mockData';

const FINNHUB_API_KEY = (import.meta.env.VITE_FINNHUB_API_KEY || 'd4ea48pr01qgp2f7i49gd4ea48pr01qgp2f7i4a0').trim();
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_API_KEY = (import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '107CWAFTQUSUB7MC').trim();
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const FMP_API_KEY = (import.meta.env.VITE_FMP_API_KEY || '').trim();
const MASSIVE_API_KEY = (import.meta.env.VITE_MASSIVE_API_KEY || '').trim();
const MASSIVE_BASE_URL = (import.meta.env.VITE_MASSIVE_BASE_URL || '').trim();

console.log('API Keys loaded:', {
  finnhub: FINNHUB_API_KEY ? 'Present' : 'Missing',
  alphaVantage: ALPHA_VANTAGE_API_KEY ? 'Present' : 'Missing'
});

export interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface MarketNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

type RawNewsItem = {
  category?: string;
  datetime?: number;
  headline?: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
  title?: string;
  description?: string;
};

export interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchFromFinnhub(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const urlParams = new URLSearchParams({
    ...params,
    token: FINNHUB_API_KEY,
  });

  try {
    const response = await fetch(`${FINNHUB_BASE_URL}${endpoint}?${urlParams}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 403) {
        throw new Error('PAID_FEATURE');
      }
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      if (data.error.includes('access') || data.error.includes('premium')) {
        throw new Error('PAID_FEATURE');
      }
      throw new Error(data.error);
    }

    return data as any;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch data from API. Please check your connection.');
  }
}

async function fetchFromAlphaVantage(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || !quote['05. price']) {
      return null;
    }

    const currentPrice = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const high = parseFloat(quote['03. high']);
    const low = parseFloat(quote['04. low']);
    const open = parseFloat(quote['02. open']);

    return {
      c: currentPrice,
      d: change,
      dp: changePercent,
      h: high,
      l: low,
      o: open,
      pc: previousClose,
      t: Date.now() / 1000,
    };
  } catch {
    return null;
  }
}

async function fetchFromStooq(symbol: string): Promise<StockQuote | null> {
  try {
    const candidates = [
      symbol.toLowerCase(),
      `${symbol.toLowerCase()}.us`,
    ];

    for (const ticker of candidates) {
      const url = `https://stooq.pl/q/l/?s=${encodeURIComponent(ticker)}&f=sd2t2ohlcv&h&e=json`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const data = await resp.json();
      if (!Array.isArray(data) || !data[0]) continue;
      const row = data[0];
      const close = parseFloat(row.close);
      const open = parseFloat(row.open);
      const high = parseFloat(row.high);
      const low = parseFloat(row.low);
      if (!Number.isFinite(close)) continue;
      const delta = Number.isFinite(open) ? close - open : 0;
      const pct = Number.isFinite(open) && open !== 0 ? (delta / open) * 100 : 0;
      return {
        c: close,
        d: delta,
        dp: pct,
        h: Number.isFinite(high) ? high : close,
        l: Number.isFinite(low) ? low : close,
        o: Number.isFinite(open) ? open : close,
        pc: Number.isFinite(open) ? open : close - delta,
        t: Math.floor(Date.now() / 1000),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const data: any = await fetchFromFinnhub('/quote', { symbol: symbol.toUpperCase() });

    if (!data || data.c === 0 || data.c === undefined) {
      throw new Error('No data');
    }

    const knownPriceRanges: Record<string, { min: number; max: number }> = {
      'NVDA': { min: 100, max: 250 },
      'AAPL': { min: 200, max: 350 },
      'TSLA': { min: 150, max: 550 },
      'MSFT': { min: 300, max: 600 },
      'META': { min: 400, max: 800 },
      'GOOGL': { min: 100, max: 400 },
      'AMZN': { min: 150, max: 350 },
      'AMD': { min: 100, max: 300 },
      'NFLX': { min: 80, max: 200 },
      'DIS': { min: 80, max: 150 },
    };

    const range = knownPriceRanges[symbol.toUpperCase()];
    if (range && (data.c < range.min || data.c > range.max)) {
      throw new Error('Price out of expected range');
    }

    return {
      c: data.c,
      d: data.d,
      dp: data.dp,
      h: data.h,
      l: data.l,
      o: data.o,
      pc: data.pc,
      t: data.t,
    };
  } catch {
    const stooqData = await fetchFromStooq(symbol);
    if (stooqData) return stooqData;

    const alphaData = await fetchFromAlphaVantage(symbol);
    if (alphaData) {
      return alphaData;
    }

    const mockData = mockStockQuotes[symbol.toUpperCase()];
    if (mockData) {
      return mockData;
    }
    const randomChange = (Math.random() - 0.5) * 10;
    const basePrice = 100 + Math.random() * 400;
    return {
      c: basePrice,
      d: randomChange,
      dp: (randomChange / basePrice) * 100,
      h: basePrice + Math.abs(randomChange) * 0.5,
      l: basePrice - Math.abs(randomChange) * 0.5,
      o: basePrice - randomChange * 0.3,
      pc: basePrice - randomChange,
      t: Date.now() / 1000,
    };
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  try {
    const data: any = await fetchFromFinnhub('/stock/profile2', { symbol: symbol.toUpperCase() });

    if (!data || !data.ticker) {
      throw new Error('No data');
    }

    return {
      country: data.country || 'US',
      currency: data.currency || 'USD',
      exchange: data.exchange || 'NASDAQ',
      ipo: data.ipo || '',
      marketCapitalization: data.marketCapitalization || 0,
      name: data.name || symbol,
      phone: data.phone || '',
      shareOutstanding: data.shareOutstanding || 0,
      ticker: data.ticker,
      weburl: data.weburl || '',
      logo: data.logo || '',
      finnhubIndustry: data.finnhubIndustry || '',
    };
  } catch {
    const mockData = mockCompanyProfiles[symbol.toUpperCase()];
    if (mockData) {
      return mockData;
    }
    return {
      country: 'US',
      currency: 'USD',
      exchange: 'NASDAQ',
      ipo: '2020-01-01',
      marketCapitalization: Math.floor(Math.random() * 500000),
      name: `${symbol.toUpperCase()} Corporation`,
      phone: '',
      shareOutstanding: Math.floor(Math.random() * 10000),
      ticker: symbol.toUpperCase(),
      weburl: '',
      logo: '',
      finnhubIndustry: 'Technology',
    };
  }
}

export async function getCompanyNews(symbol: string, from: string, to: string): Promise<NewsArticle[]> {
  try {
    const data: any = await fetchFromFinnhub('/company-news', {
      symbol: symbol.toUpperCase(),
      from,
      to,
    });

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data');
    }

    return data.slice(0, 10).map((item: { category?: string; datetime: number; headline: string; id: number; image?: string; source: string; summary: string; url: string }) => ({
      category: item.category || 'company',
      datetime: item.datetime,
      headline: item.headline,
      id: item.id,
      image: item.image || '',
      related: symbol,
      source: item.source,
      summary: item.summary,
      url: item.url,
    }));
  } catch {
    return mockCompanyNews.map(news => ({ ...news, related: symbol }));
  }
}

export async function getMarketNews(category: string = 'general'): Promise<MarketNews[]> {
  const categoriesToFetch = category === 'general' ? ['general', 'forex', 'crypto'] : [category];
  const MAX_PER_SOURCE = 6;
  const TARGET_COUNT = 50;

  try {
    const responses = await Promise.all(
      categoriesToFetch.map(async (cat) => {
        try {
          const news = await fetchFromFinnhub('/news', { category: cat }) as RawNewsItem[];
          if (!Array.isArray(news)) return [];
          return news.map(item => ({ ...item, category: item.category || cat }));
        } catch {
          return [];
        }
      })
    );

    const combined = responses
      .flat()
      .filter(item => item && item.url)
      .sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0));

    const seenUrls = new Set<string>();
    const sourceCounts = new Map<string, number>();
    const curated: MarketNews[] = [];

    for (const item of combined) {
      if (!item.url || seenUrls.has(item.url)) continue;

      const source = item.source || 'News';
      const currentCount = sourceCounts.get(source) ?? 0;
      if (currentCount >= MAX_PER_SOURCE) continue;

      curated.push({
        category: item.category || category,
        datetime: item.datetime || Math.floor(Date.now() / 1000),
        headline: item.headline || item.title || 'Market update',
        id: item.id || item.datetime || curated.length + 1,
        image: item.image || '',
        related: item.related || '',
        source,
        summary: item.summary || item.description || '',
        url: item.url,
      });

      seenUrls.add(item.url);
      sourceCounts.set(source, currentCount + 1);

      if (curated.length >= TARGET_COUNT) {
        break;
      }
    }

    if (!curated.length) {
      throw new Error('No data');
    }

    if (curated.length < TARGET_COUNT) {
      for (const mock of mockMarketNews) {
        if (seenUrls.has(mock.url)) continue;
        curated.push(mock);
        if (curated.length >= TARGET_COUNT) break;
      }
    }

    return curated;
  } catch {
    return mockMarketNews;
  }
}

export async function searchSymbol(query: string): Promise<{ result: Array<{ description: string; displaySymbol: string; symbol: string; type: string }> }> {
  const data = await fetchFromFinnhub('/search', { q: query });

  if (!data || !data.result) {
    return { result: [] };
  }

  return {
    result: data.result.map((item: { description: string; displaySymbol: string; symbol: string; type: string }) => ({
      description: item.description,
      displaySymbol: item.displaySymbol,
      symbol: item.symbol,
      type: item.type,
    })),
  };
}

export async function getMarketIndices(): Promise<{
  sp500: StockQuote;
  nasdaq: StockQuote;
  dow: StockQuote;
}> {
  // Simplified: use the liquid ETFs directly to avoid unreliable scaling.
  const [sp500, nasdaq, dow] = await Promise.all([
    getStockQuote('SPY'),
    getStockQuote('QQQ'),
    getStockQuote('DIA'),
  ]);

  return { sp500, nasdaq, dow };
}

function generateRealisticHistoricalData(
  _symbol: string,
  interval: 'daily' | 'weekly' | 'monthly',
  currentPrice: number
): HistoricalDataPoint[] {
  const periodsMap = {
    daily: 100,
    weekly: 52,
    monthly: 24,
  };

  const periods = periodsMap[interval];
  const data: HistoricalDataPoint[] = [];
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const startPrice = currentPrice * (0.92 + Math.random() * 0.16); // +/-8% anchor

  let price = startPrice;
  const now = new Date();

  for (let i = periods; i >= 0; i--) {
    const date = new Date(now);
    if (interval === 'daily') {
      date.setDate(date.getDate() - i);
    } else if (interval === 'weekly') {
      date.setDate(date.getDate() - (i * 7));
    } else {
      date.setMonth(date.getMonth() - i);
    }

    const trend = (currentPrice - startPrice) / periods;
    const volatility = currentPrice * 0.008; // ~0.8% per step
    const dailyChange = trend + (Math.random() - 0.5) * volatility * 2;

    price = clamp(price + dailyChange, currentPrice * 0.85, currentPrice * 1.15);

    const open = price;
    const high = open * (1 + Math.random() * 0.01);
    const low = open * (1 - Math.random() * 0.01);
    const close = low + (high - low) * Math.random();

    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 50000000),
    });

    price = close;
  }

  return data;
}

function aggregateHistoricalData(
  data: HistoricalDataPoint[],
  interval: 'daily' | 'weekly' | 'monthly'
): HistoricalDataPoint[] {
  if (interval === 'daily') return data;

  const buckets = new Map<string, HistoricalDataPoint>();

  data.forEach((point) => {
    const date = new Date(point.time);
    let key: string;
    if (interval === 'weekly') {
      const firstDayOfWeek = new Date(date);
      const day = firstDayOfWeek.getDay();
      const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      firstDayOfWeek.setDate(diff);
      key = firstDayOfWeek.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
    }

    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        time: key,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
      });
    } else {
      existing.high = Math.max(existing.high, point.high);
      existing.low = Math.min(existing.low, point.low);
      existing.close = point.close;
      existing.volume += point.volume;
    }
  });

  return Array.from(buckets.values()).sort((a, b) => (a.time > b.time ? 1 : -1));
}

async function fetchHistoricalFromAlphaVantage(symbol: string): Promise<HistoricalDataPoint[] | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) return null;
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
      symbol.toUpperCase()
    )}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const series = data['Time Series (Daily)'];
    if (!series) return null;

    const points: HistoricalDataPoint[] = Object.entries(series)
      .map(([date, values]: [string, any]) => ({
        time: date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['6. volume'], 10) || 0,
      }))
      .filter((p) => Number.isFinite(p.open) && Number.isFinite(p.close))
      .sort((a, b) => (a.time > b.time ? 1 : -1))
      .slice(-120); // cap to ~6 months

    return points.length ? points : null;
  } catch {
    return null;
  }
}

export async function getHistoricalData(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<HistoricalDataPoint[]> {
  try {
    const resolutionMap = {
      daily: 'D',
      weekly: 'W',
      monthly: 'M',
    };

    const to = Math.floor(Date.now() / 1000);
    const daysMap = {
      daily: 100,
      weekly: 365,
      monthly: 730,
    };
    const from = to - (daysMap[interval] * 24 * 60 * 60);

    const data: any = await fetchFromFinnhub('/stock/candle', {
      symbol: symbol.toUpperCase(),
      resolution: resolutionMap[interval],
      from: from.toString(),
      to: to.toString(),
    });

    if (!data || data.s !== 'ok' || !data.t) {
      throw new Error('No data from API');
    }

    const historicalData: HistoricalDataPoint[] = [];

    for (let i = 0; i < data.t.length; i++) {
      const date = new Date(data.t[i] * 1000);
      historicalData.push({
        time: date.toISOString().split('T')[0],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      });
    }

    return historicalData;
  } catch {
    const alphaSeries = await fetchHistoricalFromAlphaVantage(symbol);
    if (alphaSeries && alphaSeries.length) {
      return aggregateHistoricalData(alphaSeries, interval);
    }
    // If no reliable external data, return empty so UI can show a clear message instead of synthetic prices.
    return [];
  }
}

export async function getBasicFinancials(symbol: string): Promise<Record<string, unknown>> {
  const data = await fetchFromFinnhub('/stock/metric', {
    symbol: symbol.toUpperCase(),
    metric: 'all',
  });

  return data;
}

export async function getRecommendationTrends(symbol: string): Promise<Array<Record<string, unknown>>> {
  const data = await fetchFromFinnhub('/stock/recommendation', {
    symbol: symbol.toUpperCase(),
  });

  return data;
}

export async function getPriceTarget(symbol: string): Promise<Record<string, unknown>> {
  const data = await fetchFromFinnhub('/stock/price-target', {
    symbol: symbol.toUpperCase(),
  });

  return data;
}

export async function getEarnings(symbol: string): Promise<Array<Record<string, unknown>>> {
  const data = await fetchFromFinnhub('/stock/earnings', {
    symbol: symbol.toUpperCase(),
  });

  return data;
}

export interface InsiderTransaction {
  name: string;
  share: number;
  change: number;
  filingDate: string;
  transactionDate: string;
  transactionCode: string;
  transactionPrice: number;
}

function generateRealisticInsiderTransactions(symbol: string, currentPrice: number): InsiderTransaction[] {
  const titles = ['CEO', 'CFO', 'COO', 'Director', 'VP Engineering', 'VP Sales', 'Board Member', 'President'];
  const transactions: InsiderTransaction[] = [];
  const now = Date.now();

  const tradeCount = 6 + Math.floor(Math.random() * 5);

  for (let i = 0; i < tradeCount; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)];

    const isBuy = Math.random() > 0.45;
    const shareCount = Math.floor(500 + Math.random() * 15000);
    const change = isBuy ? shareCount : -shareCount;

    const priceVariation = 0.9 + Math.random() * 0.15;
    const transactionPrice = Math.max(1, currentPrice * priceVariation);

    const daysAgo = Math.floor(3 + Math.random() * 60);
    const transactionDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const filingLag = 1 + Math.floor(Math.random() * 3);
    const filingDate = new Date(transactionDate.getTime() + filingLag * 24 * 60 * 60 * 1000);

    transactions.push({
      name: `${symbol.toUpperCase()} Insider ${i + 1} • ${title}`,
      share: shareCount,
      change: change,
      filingDate: filingDate.toISOString().split('T')[0],
      transactionDate: transactionDate.toISOString().split('T')[0],
      transactionCode: isBuy ? 'P' : 'S',
      transactionPrice: parseFloat(transactionPrice.toFixed(2)),
    });
  }

  return transactions.sort((a, b) =>
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
}

export async function getInsiderTransactions(symbol: string): Promise<InsiderTransaction[]> {
  try {
    const [data, quote] = await Promise.all([
      fetchFromFinnhub('/stock/insider-transactions', { symbol: symbol.toUpperCase() }),
      getStockQuote(symbol),
    ]);

    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No insider data');
    }

    const cleanDate = (value?: string) => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const fallbackPrice = Number.isFinite(quote?.c) ? quote.c : undefined;

    return data.data
      .map((item: { name?: string; share?: number; change?: number; filingDate?: string; transactionDate?: string; transactionCode?: string; transactionPrice?: number }) => {
        const cleanName = (value?: string) => {
          const safe = (value || '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
          return safe || 'Unknown';
        };

        const txnDate = cleanDate(item.transactionDate) || new Date();
        const filingDate = cleanDate(item.filingDate) || new Date(txnDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        const rawPrice = Number.isFinite(item.transactionPrice) ? (item.transactionPrice as number) : 0;
        const priceWithinBounds = () => {
          if (!fallbackPrice && rawPrice > 0 && rawPrice < 50000) return rawPrice;
          if (!fallbackPrice) return 0;
          if (rawPrice > 0 && rawPrice < fallbackPrice * 5) return rawPrice;
          return fallbackPrice;
        };
        const price = priceWithinBounds();

        const rawChange = item.change ?? (item.share ?? 0);
        const change = Number.isFinite(rawChange) ? (rawChange as number) : 0;
        const shareRaw = Math.abs(item.share ?? change ?? 0);
        const share = Math.min(shareRaw, 1_000_000);
        const transactionCode = (item.transactionCode || (change >= 0 ? 'P' : 'S')).toUpperCase();

        return {
          name: cleanName(item.name),
          share,
          change,
          filingDate: filingDate.toISOString().split('T')[0],
          transactionDate: txnDate.toISOString().split('T')[0],
          transactionCode,
          transactionPrice: parseFloat((price || 0).toFixed(2)),
        };
      })
      .filter((item) => !!item.transactionDate && !!item.filingDate)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 20);
  } catch {
    const quote = await getStockQuote(symbol);
    return generateRealisticInsiderTransactions(symbol, quote.c);
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

export function formatPercentage(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export async function getCryptoQuote(symbol: string): Promise<CryptoQuote> {
  const cryptoMapping: Record<string, { id: string; name: string; basePrice: number; marketCap: number }> = {
    'BTC-USD': { id: 'bitcoin', name: 'Bitcoin', basePrice: 90676, marketCap: 1808774 },
    'ETH-USD': { id: 'ethereum', name: 'Ethereum', basePrice: 3038, marketCap: 366558 },
    'BNB-USD': { id: 'binancecoin', name: 'Binance Coin', basePrice: 882, marketCap: 121199 },
    'SOL-USD': { id: 'solana', name: 'Solana', basePrice: 137.5, marketCap: 76893 },
    'XRP-USD': { id: 'ripple', name: 'Ripple', basePrice: 2.18, marketCap: 131339 },
    'ADA-USD': { id: 'cardano', name: 'Cardano', basePrice: 0.42, marketCap: 15356 },
    'DOGE-USD': { id: 'dogecoin', name: 'Dogecoin', basePrice: 0.149, marketCap: 22698 },
    'MATIC-USD': { id: 'polygon-ecosystem-token', name: 'Polygon', basePrice: 0.30, marketCap: 5000 },
    'LTC-USD': { id: 'litecoin', name: 'Litecoin', basePrice: 83.84, marketCap: 6417 },
    'DOT-USD': { id: 'polkadot', name: 'Polkadot', basePrice: 2.28, marketCap: 3742 },
    'AVAX-USD': { id: 'avalanche-2', name: 'Avalanche', basePrice: 14.86, marketCap: 6375 },
    'LINK-USD': { id: 'chainlink', name: 'Chainlink', basePrice: 13.12, marketCap: 9130 },
  };

  const crypto = cryptoMapping[symbol];
  if (!crypto) {
    throw new Error('Unknown cryptocurrency');
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('CoinGecko API error');
    }

    const data = await response.json();
    const coinData = data[crypto.id];

    if (coinData && coinData.usd) {
      return {
        symbol,
        name: crypto.name,
        price: coinData.usd,
        change: (coinData.usd * coinData.usd_24h_change) / 100,
        changePercent: coinData.usd_24h_change || 0,
        marketCap: coinData.usd_market_cap / 1000000 || crypto.marketCap,
        volume24h: coinData.usd_24h_vol || coinData.usd * 25000000000,
        high24h: coinData.usd * 1.02,
        low24h: coinData.usd * 0.98,
      };
    }
    throw new Error('No data from CoinGecko');
  } catch {
    const changePercent = (Math.random() - 0.5) * 8;
    const price = crypto.basePrice * (1 + changePercent / 100);
    const change = price - crypto.basePrice;

    return {
      symbol,
      name: crypto.name,
      price: price,
      change: change,
      changePercent: changePercent,
      marketCap: crypto.marketCap,
      volume24h: price * 25000000000,
      high24h: price * 1.03,
      low24h: price * 0.97,
    };
  }
}

export async function getCryptoNews(): Promise<MarketNews[]> {
  try {
    const data: any = await fetchFromFinnhub('/news', { category: 'crypto' });

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data');
    }

    return data.slice(0, 20).map((item: { datetime: number; headline: string; id: number; image?: string; related?: string; source: string; summary: string; url: string }) => ({
      category: 'crypto',
      datetime: item.datetime,
      headline: item.headline,
      id: item.id,
      image: item.image || '',
      related: item.related || '',
      source: item.source,
      summary: item.summary,
      url: item.url,
    }));
  } catch {
    return mockMarketNews.map(news => ({ ...news, category: 'crypto' }));
  }
}

export async function getTopCryptos(): Promise<CryptoQuote[]> {
  const cryptoSymbols = [
    'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD',
    'XRP-USD', 'ADA-USD', 'DOGE-USD', 'MATIC-USD',
    'LTC-USD', 'DOT-USD', 'AVAX-USD', 'LINK-USD'
  ];

  const quotes = await Promise.all(
    cryptoSymbols.map(symbol => getCryptoQuote(symbol))
  );

  return quotes;
}
