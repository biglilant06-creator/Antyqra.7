import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WatchlistItem {
  id: string;
  symbol: string;
  created_at: string;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }

  return data || [];
}

export async function addToWatchlist(symbol: string): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .insert([{ symbol: symbol.toUpperCase() }]);

  if (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }

  return true;
}

export async function removeFromWatchlist(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }

  return true;
}

export interface CryptoWatchlistItem {
  id: string;
  symbol: string;
  name: string;
  created_at: string;
}

export async function getCryptoWatchlist(): Promise<CryptoWatchlistItem[]> {
  const { data, error } = await supabase
    .from('crypto_watchlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching crypto watchlist:', error);
    return [];
  }

  return data || [];
}

export async function addToCryptoWatchlist(symbol: string, name: string): Promise<boolean> {
  const { error } = await supabase
    .from('crypto_watchlist')
    .insert([{ symbol: symbol.toUpperCase(), name }]);

  if (error) {
    console.error('Error adding to crypto watchlist:', error);
    return false;
  }

  return true;
}

export async function removeFromCryptoWatchlist(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('crypto_watchlist')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from crypto watchlist:', error);
    return false;
  }

  return true;
}
