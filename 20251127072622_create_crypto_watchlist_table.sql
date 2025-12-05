/*
  # Create crypto_watchlist table

  1. New Tables
    - `crypto_watchlist`
      - `id` (uuid, primary key) - Unique identifier for each watchlist entry
      - `symbol` (text) - Cryptocurrency symbol (e.g., 'BTC-USD', 'ETH-USD')
      - `name` (text) - Cryptocurrency name (e.g., 'Bitcoin', 'Ethereum')
      - `created_at` (timestamptz) - Timestamp when the entry was added
  
  2. Security
    - Enable RLS on `crypto_watchlist` table
    - Add policy for users to read all crypto watchlist entries
    - Add policy for users to insert new crypto to watchlist
    - Add policy for users to delete entries from watchlist
  
  3. Notes
    - This table stores user's favorite cryptocurrencies for quick access
    - No authentication required for this demo app (public access)
*/

CREATE TABLE IF NOT EXISTS crypto_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crypto_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to crypto watchlist"
  ON crypto_watchlist
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to crypto watchlist"
  ON crypto_watchlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete from crypto watchlist"
  ON crypto_watchlist
  FOR DELETE
  USING (true);
