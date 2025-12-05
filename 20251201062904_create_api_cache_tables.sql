/*
  # API Cache & Market Data Schema

  1. New Tables
    - `market_cache`
      - Caches market overview data (sentiment, prices, etc.)
      - TTL: 5-10 minutes
    - `news_cache`
      - Stores normalized news articles from all sources
      - Deduplicates by URL
      - Includes sentiment scores and impact levels
    - `company_relationships`
      - Tracks partnerships, suppliers, customers for galaxy view
      - Edges between companies with relationship types
    - `crypto_cache`
      - Caches crypto prices and market data
    
  2. Security
    - Enable RLS on all tables
    - Public read access for cached data
    - Service role only for writes
*/

-- Market cache for overview data
CREATE TABLE IF NOT EXISTS market_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_cache_key ON market_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_market_cache_expires ON market_cache(expires_at);

ALTER TABLE market_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-expired cache"
  ON market_cache FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- News cache with sentiment and impact
CREATE TABLE IF NOT EXISTS news_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  source text NOT NULL,
  title text NOT NULL,
  summary text DEFAULT '',
  content text DEFAULT '',
  category text NOT NULL, -- 'market' or 'geopolitical'
  tickers text[] DEFAULT ARRAY[]::text[],
  sectors text[] DEFAULT ARRAY[]::text[],
  sentiment_score integer DEFAULT 50,
  impact_level text DEFAULT 'LOW', -- 'LOW', 'MODERATE', 'HIGH'
  confidence decimal DEFAULT 0.5,
  timeframe text DEFAULT 'Short-term',
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_url ON news_cache(url);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_cache(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_cache(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_cache(impact_level);

ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recent news"
  ON news_cache FOR SELECT
  TO anon, authenticated
  USING (published_at > now() - interval '7 days');

-- Company relationships for galaxy view
CREATE TABLE IF NOT EXISTS company_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_a text NOT NULL,
  company_b text NOT NULL,
  ticker_a text,
  ticker_b text,
  relationship_type text NOT NULL, -- 'partner', 'supplier', 'customer', 'competitor', 'peer'
  strength decimal DEFAULT 0.5, -- 0-1 for visualization
  source_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_a, company_b, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_relationships_company_a ON company_relationships(company_a);
CREATE INDEX IF NOT EXISTS idx_relationships_company_b ON company_relationships(company_b);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON company_relationships(relationship_type);

ALTER TABLE company_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read relationships"
  ON company_relationships FOR SELECT
  TO anon, authenticated
  USING (true);

-- Crypto cache
CREATE TABLE IF NOT EXISTS crypto_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crypto_cache_key ON crypto_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_crypto_cache_expires ON crypto_cache(expires_at);

ALTER TABLE crypto_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-expired crypto cache"
  ON crypto_cache FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());
