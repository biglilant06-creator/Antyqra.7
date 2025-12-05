import { useEffect, useState } from 'react';
import { Star, X, TrendingUp, TrendingDown, Plus, Loader2 } from 'lucide-react';
import * as supabaseService from '../services/supabase';
import * as stockApi from '../services/stockApi';
import Toast from './Toast';

export default function CryptoWatchlist() {
  const [watchlist, setWatchlist] = useState<supabaseService.CryptoWatchlistItem[]>([]);
  const [cryptoData, setCryptoData] = useState<Record<string, stockApi.CryptoQuote>>({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const availableCryptos = [
    { symbol: 'BTC-USD', name: 'Bitcoin' },
    { symbol: 'ETH-USD', name: 'Ethereum' },
    { symbol: 'BNB-USD', name: 'Binance Coin' },
    { symbol: 'SOL-USD', name: 'Solana' },
    { symbol: 'XRP-USD', name: 'Ripple' },
    { symbol: 'ADA-USD', name: 'Cardano' },
    { symbol: 'DOGE-USD', name: 'Dogecoin' },
    { symbol: 'MATIC-USD', name: 'Polygon' },
    { symbol: 'LTC-USD', name: 'Litecoin' },
    { symbol: 'DOT-USD', name: 'Polkadot' },
    { symbol: 'AVAX-USD', name: 'Avalanche' },
    { symbol: 'LINK-USD', name: 'Chainlink' },
  ];

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    const data = await supabaseService.getCryptoWatchlist();
    setWatchlist(data);

    const quotes: Record<string, stockApi.CryptoQuote> = {};
    for (const item of data) {
      try {
        const quote = await stockApi.getCryptoQuote(item.symbol);
        quotes[item.symbol] = quote;
      } catch (error) {
        console.error(`Error fetching quote for ${item.symbol}:`, error);
      }
    }
    setCryptoData(quotes);
    setLoading(false);
  };

  const handleAdd = async (symbol: string, name: string) => {
    const exists = watchlist.some(item => item.symbol === symbol);
    if (exists) {
      setToastMessage('Already in watchlist');
      setShowToast(true);
      return;
    }

    const success = await supabaseService.addToCryptoWatchlist(symbol, name);
    if (success) {
      setToastMessage(`${name} added to watchlist`);
      setShowToast(true);
      setShowAddMenu(false);
      loadWatchlist();
    }
  };

  const handleRemove = async (id: string) => {
    const success = await supabaseService.removeFromCryptoWatchlist(id);
    if (success) {
      setToastMessage('Removed from watchlist');
      setShowToast(true);
      loadWatchlist();
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
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Star className="w-7 h-7 text-teal-400" />
            <span>Crypto Watchlist</span>
          </h2>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {showAddMenu && (
          <div className="mb-6 bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Add Cryptocurrency</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableCryptos.map(crypto => (
                <button
                  key={crypto.symbol}
                  onClick={() => handleAdd(crypto.symbol, crypto.name)}
                  className="px-3 py-2 bg-slate-700 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {crypto.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No cryptocurrencies in watchlist</p>
            <p className="text-slate-500 text-sm">Click "Add" to start tracking your favorites</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item) => {
              const quote = cryptoData[item.symbol];
              return (
                <div
                  key={item.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-teal-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-bold text-lg">{item.name}</h3>
                        <span className="text-slate-400 text-sm">{item.symbol}</span>
                      </div>
                      {quote && (
                        <>
                          <div className="flex items-baseline space-x-3 mb-2">
                            <span className="text-white font-bold text-2xl">
                              {stockApi.formatPrice(quote.price)}
                            </span>
                            <span
                              className={`flex items-center space-x-1 font-semibold ${
                                quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {quote.changePercent >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>{stockApi.formatPercentage(quote.changePercent)}</span>
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            <span>Market Cap: </span>
                            <span className="text-white font-semibold">
                              ${stockApi.formatNumber(quote.marketCap * 1000000)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from watchlist"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </>
  );
}
