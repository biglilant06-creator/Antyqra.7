import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import * as stockApi from '../services/stockApi';
import { mockStockQuotes } from '../services/mockData';

export default function MarketOverview() {
  const [loading, setLoading] = useState(true);
  const [indices, setIndices] = useState<{
    sp500: stockApi.StockQuote | null;
    nasdaq: stockApi.StockQuote | null;
    dow: stockApi.StockQuote | null;
  }>({ sp500: null, nasdaq: null, dow: null });

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const data = await stockApi.getMarketIndices();
        setIndices(data);
      } catch (error) {
        console.error('Error fetching market indices:', error);
        setIndices({
          sp500: mockStockQuotes['SPY'],
          nasdaq: mockStockQuotes['QQQ'],
          dow: mockStockQuotes['DIA'],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
    const interval = setInterval(fetchIndices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const renderIndex = (name: string, symbol: string, quote: stockApi.StockQuote | null) => {
    if (!quote) return null;

    const isPositive = quote.d > 0;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500">{symbol}</p>
          </div>
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-black text-slate-900">{stockApi.formatPrice(quote.c)}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <span>{isPositive ? '+' : ''}{stockApi.formatPrice(quote.d)}</span>
            <span>({stockApi.formatPercentage(quote.dp)})</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Open</p>
            <p className="text-slate-900 font-semibold">{stockApi.formatPrice(quote.o)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-1">Prev Close</p>
            <p className="text-slate-900 font-semibold">{stockApi.formatPrice(quote.pc)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Market Indices</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderIndex('S&P 500', 'SPY', indices.sp500)}
        {renderIndex('NASDAQ', 'QQQ', indices.nasdaq)}
        {renderIndex('DOW JONES', 'DIA', indices.dow)}
      </div>
    </div>
  );
}
