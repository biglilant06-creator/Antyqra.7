import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Flame, Loader2 } from 'lucide-react';
import { getStockQuote, StockQuote } from '../services/stockApi';
import { mockGainers, mockLosers } from '../services/mockData';

interface MoverStock {
  symbol: string;
  name: string;
  quote: StockQuote | null;
}

export default function TodaysMovers() {
  const [gainers, setGainers] = useState<MoverStock[]>([]);
  const [losers, setLosers] = useState<MoverStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const watchlist = [
          { symbol: 'NVDA', name: 'NVIDIA' },
          { symbol: 'TSLA', name: 'Tesla' },
          { symbol: 'AAPL', name: 'Apple' },
          { symbol: 'META', name: 'Meta' },
          { symbol: 'GOOGL', name: 'Google' },
          { symbol: 'MSFT', name: 'Microsoft' },
          { symbol: 'AMD', name: 'AMD' },
          { symbol: 'AMZN', name: 'Amazon' },
          { symbol: 'NFLX', name: 'Netflix' },
          { symbol: 'DIS', name: 'Disney' }
        ];

        const quotes = await Promise.all(
          watchlist.map(async (stock) => {
            try {
              const quote = await getStockQuote(stock.symbol);
              return { ...stock, quote };
            } catch {
              return { ...stock, quote: null };
            }
          })
        );

        const validQuotes = quotes.filter((q) => q.quote !== null);
        validQuotes.sort((a, b) => (b.quote?.dp || 0) - (a.quote?.dp || 0));

        setGainers(validQuotes.slice(0, 5));
        setLosers(validQuotes.slice(-5).reverse());
        setLoading(false);
      } catch {
        setGainers(mockGainers);
        setLosers(mockLosers);
        setLoading(false);
      }
    };

    fetchMovers();
    const interval = setInterval(fetchMovers, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </div>
    );
  }

  const renderMover = (stock: MoverStock, isGainer: boolean) => {
    if (!stock.quote) return null;

    return (
      <div
        key={stock.symbol}
        className={`p-4 rounded-xl border ${
          isGainer
            ? 'bg-teal-500/10 border-teal-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        } hover:bg-slate-800/50 transition-all`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-black text-white text-lg">{stock.symbol}</div>
            <div className="text-slate-400 text-xs">{stock.name}</div>
          </div>
          <div className={`p-2 rounded-lg ${isGainer ? 'bg-teal-500/20' : 'bg-rose-500/20'}`}>
            {isGainer ? (
              <TrendingUp className="w-5 h-5 text-teal-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white text-2xl font-black">
            ${stock.quote.c.toFixed(2)}
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm ${
              isGainer
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            <span>{isGainer ? '+' : ''}{stock.quote.d.toFixed(2)}</span>
            <span>({stock.quote.dp.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-5 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">Today's Biggest Movers</h3>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">Top gainers and losers of the day</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="text-teal-400 font-black text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Gainers
            </h4>
            <div className="space-y-3">
              {gainers.map((stock) => renderMover(stock, true))}
            </div>
          </div>

          <div>
            <h4 className="text-rose-400 font-black text-xl mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Top Losers
            </h4>
            <div className="space-y-3">
              {losers.map((stock) => renderMover(stock, false))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
