import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Loader2, DollarSign, Activity, Zap } from 'lucide-react';
import * as stockApi from '../services/stockApi';
import CryptoWatchlist from './CryptoWatchlist';

export default function CryptoWatcher() {
  const [loading, setLoading] = useState(true);
  const [cryptos, setCryptos] = useState<stockApi.CryptoQuote[]>([]);
  const [news, setNews] = useState<stockApi.MarketNews[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cryptoData, newsData] = await Promise.all([
          stockApi.getTopCryptos(),
          stockApi.getCryptoNews(),
        ]);
        setCryptos(cryptoData);
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-16 h-16 text-teal-400 animate-spin mb-4" />
        <div className="text-teal-400 font-bold text-lg animate-pulse">Loading Crypto Data...</div>
      </div>
    );
  }

  const topGainers = [...cryptos].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const topLosers = [...cryptos].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const totalMarketCap = cryptos.reduce((sum, crypto) => sum + crypto.marketCap, 0);

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Cryptocurrency Market</h1>
            <p className="text-teal-50 text-lg">Real-time crypto prices, news, and market insights</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-teal-400" />
                <span className="text-slate-400 text-sm font-medium">Total Market Cap</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${stockApi.formatNumber(totalMarketCap * 1000000)}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 text-sm font-medium">Top Gainer</span>
              </div>
              <div className="text-xl font-bold text-white">{topGainers[0]?.name}</div>
              <div className="text-emerald-400 font-semibold">
                {stockApi.formatPercentage(topGainers[0]?.changePercent || 0)}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-400 text-sm font-medium">Assets Tracked</span>
              </div>
              <div className="text-2xl font-bold text-white">{cryptos.length}</div>
            </div>
          </div>

          <CryptoWatchlist />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <Zap className="w-7 h-7 text-teal-400" />
              <span>Top Cryptocurrencies</span>
            </h2>
            <div className="space-y-3">
              {cryptos.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-teal-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-slate-500 font-bold text-lg w-8">#{index + 1}</div>
                      <div>
                        <div className="font-bold text-white text-lg">{crypto.name}</div>
                        <div className="text-slate-400 text-sm">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-xl">
                        {stockApi.formatPrice(crypto.price)}
                      </div>
                      <div className={`flex items-center justify-end space-x-1 font-semibold text-sm ${
                        crypto.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {crypto.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{stockApi.formatPercentage(crypto.changePercent)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Market Cap: </span>
                      <span className="text-white font-semibold">
                        ${stockApi.formatNumber(crypto.marketCap * 1000000)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">24h Volume: </span>
                      <span className="text-white font-semibold">
                        ${stockApi.formatNumber(crypto.volume24h)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <span>Top Gainers</span>
              </h3>
              <div className="space-y-3">
                {topGainers.map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{crypto.name}</div>
                      <div className="text-slate-400 text-sm">{stockApi.formatPrice(crypto.price)}</div>
                    </div>
                    <div className="text-emerald-400 font-bold text-lg">
                      {stockApi.formatPercentage(crypto.changePercent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingDown className="w-6 h-6 text-red-400" />
                <span>Top Losers</span>
              </h3>
              <div className="space-y-3">
                {topLosers.map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{crypto.name}</div>
                      <div className="text-slate-400 text-sm">{stockApi.formatPrice(crypto.price)}</div>
                    </div>
                    <div className="text-red-400 font-bold text-lg">
                      {stockApi.formatPercentage(crypto.changePercent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Crypto News</h3>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {news.slice(0, 10).map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-teal-500/30 transition-all">
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.headline}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="text-white font-semibold text-sm mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">
                      {article.headline}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{article.source}</span>
                      <span className="text-slate-500">
                        {new Date(article.datetime * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
