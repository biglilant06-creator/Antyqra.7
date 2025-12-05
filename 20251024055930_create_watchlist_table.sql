/*
  # Create Watchlist Table

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key) - Unique identifier for each watchlist item
      - `symbol` (text) - Stock ticker symbol (e.g., AAPL, TSLA)
      - `name` (text) - Company name
      - `added_at` (timestamptz) - When the stock was added to watchlist
  
  2. Security
    - Enable RLS on `watchlist` table
    - Add policy for anyone to read watchlist (public app)
    - Add policy for anyone to manage watchlist items (public app)
  
  3. Notes
    - This is a public application without authentication
    - All users share the same watchlist
    - In production, you would add user authentication and user-specific watchlists
*/

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  added_at timestamptz DEFAULT now()
);

-- Create index for faster symbol lookups
CREATE INDEX IF NOT EXISTS watchlist_symbol_idx ON watchlist(symbol);

-- Enable Row Level Security
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (public app)
CREATE POLICY "Allow public read access"
  ON watchlist
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON watchlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON watchlist
  FOR DELETE
  TO anon
  USING (true);
