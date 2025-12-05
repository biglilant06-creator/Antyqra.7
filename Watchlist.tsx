import { useEffect, useState } from 'react';
import { Star, Trash2, TrendingUp, TrendingDown, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { getStockQuote, StockQuote } from '../services/stockApi';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  added_at: string;
  quote?: StockQuote | null;
}

interface WatchlistProps {
  onStockSelect: (symbol: string) => void;
}

export default function Watchlist({ onStockSelect }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSymbol, setAddingSymbol] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;

      const itemsWithQuotes = await Promise.all(
        (data || []).map(async (item) => {
          try {
            const quote = await getStockQuote(item.symbol);
            return { ...item, quote };
          } catch {
            return { ...item, quote: null };
          }
        })
      );

      setWatchlist(itemsWithQuotes);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSymbol.trim()) return;

    setAdding(true);
    try {
      const symbol = addingSymbol.toUpperCase().trim();

      const existing = watchlist.find(item => item.symbol === symbol);
      if (existing) {
        alert('Stock already in watchlist');
        setAdding(false);
        return;
      }

      await getStockQuote(symbol);

      const { error } = await supabase
        .from('watchlist')
        .insert([{ symbol, name: symbol }]);

      if (error) throw error;

      await fetchWatchlist();
      setAddingSymbol('');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add stock. Please check the symbol and try again.');
    } finally {
      setAdding(false);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWatchlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="border-b border-slate-800 px-6 sm:px-8 py-5 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Your Watchlist</h3>
            <p className="text-slate-400 text-sm">Track your favorite stocks</p>
          </div>
        </div>

        <form onSubmit={addToWatchlist} className="flex gap-2">
          <input
            type="text"
            value={addingSymbol}
            onChange={(e) => setAddingSymbol(e.target.value)}
            placeholder="Add symbol (e.g., AAPL)"
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || !addingSymbol.trim()}
            className="px-5 py-2.5 bg-teal-500 active:bg-teal-600 lg:hover:bg-teal-600 disabled:bg-slate-700 text-white disabled:text-slate-500 font-bold rounded-xl transition-all disabled:cursor-not-allowed flex items-center gap-2"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </form>
      </div>

      <div className="p-4 sm:p-6">
        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">Your watchlist is empty</p>
            <p className="text-slate-500 text-sm">Add stocks to track them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => onStockSelect(item.symbol)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-lg mb-1">{item.symbol}</div>
                        {item.quote && (
                          <div className="text-sm">
                            <span className="text-white font-semibold">${item.quote.c.toFixed(2)}</span>
                            <span className={`ml-2 font-bold ${item.quote.d >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                              {item.quote.d >= 0 ? '+' : ''}{item.quote.d.toFixed(2)} ({item.quote.dp.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                      </div>
                      {item.quote && (
                        <div className={`p-2 rounded-lg ${item.quote.d >= 0 ? 'bg-teal-500/20' : 'bg-rose-500/20'}`}>
                          {item.quote.d >= 0 ? (
                            <TrendingUp className="w-5 h-5 text-teal-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.id);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
