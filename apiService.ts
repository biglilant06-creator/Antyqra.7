const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface MarketOverview {
  sentimentScore: number;
  bullishPct: number;
  bearishPct: number;
  fearGreed: number;
  tickers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changesPercentage: number;
    marketCap: number;
    volume: number;
  }>;
  lastUpdated: string;
}

export interface NewsArticle {
  id: string;
  url: string;
  source: string;
  title: string;
  summary: string;
  content: string;
  category: 'market' | 'geopolitical';
  tickers: string[];
  sectors: string[];
  sentiment_score: number;
  impact_level: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  timeframe: string;
  published_at: string;
}

export interface MarketImpact {
  impactNews: {
    HIGH: NewsArticle[];
    MODERATE: NewsArticle[];
    LOW: NewsArticle[];
  };
  summary: {
    totalArticles: number;
    highImpact: number;
    moderateImpact: number;
    lowImpact: number;
    topSectors: string[];
    topTickers: string[];
  };
  lastUpdated: string;
}

export interface CryptoOverview {
  totalMarketCap: number;
  marketCapChange24h: number;
  gainersCount: number;
  losersCount: number;
  topGainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
  }>;
  topLosers: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
  }>;
  topCryptos: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume: number;
    high24h: number;
    low24h: number;
  }>;
  lastUpdated: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getMarketOverview(): Promise<MarketOverview> {
    return this.fetch<MarketOverview>('market-overview');
  }

  async getMarketNews(limit = 30): Promise<NewsArticle[]> {
    return this.fetch<NewsArticle[]>(`market-news?limit=${limit}`);
  }

  async getGeopoliticalNews(limit = 30): Promise<NewsArticle[]> {
    return this.fetch<NewsArticle[]>(`geopolitical-news?limit=${limit}`);
  }

  async getMarketImpact(level?: 'HIGH' | 'MODERATE' | 'LOW', category?: 'market' | 'geopolitical'): Promise<MarketImpact> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (category) params.append('category', category);

    const query = params.toString();
    return this.fetch<MarketImpact>(`market-impact${query ? '?' + query : ''}`);
  }

  async getCryptoOverview(): Promise<CryptoOverview> {
    return this.fetch<CryptoOverview>('crypto-overview');
  }
}

export const apiService = new ApiService();
