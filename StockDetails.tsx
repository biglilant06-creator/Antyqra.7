import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Target } from 'lucide-react';
import * as stockApi from '../services/stockApi';
import StockChart from './StockChart';

interface StockDetailsProps {
  symbol: string;
}

export default function StockDetails({ symbol }: StockDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<stockApi.StockQuote | null>(null);
  const [profile, setProfile] = useState<stockApi.CompanyProfile | null>(null);
  const [news, setNews] = useState<stockApi.NewsArticle[]>([]);
  const [financials, setFinancials] = useState<Record<string, unknown> | null>(null);
  const [recommendations, setRecommendations] = useState<Array<Record<string, unknown>>>([]);
  const [priceTarget, setPriceTarget] = useState<Record<string, unknown> | null>(null);
  const [earnings, setEarnings] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateRange = stockApi.getDateRange(30);

        const quoteData = await stockApi.getStockQuote(symbol);
        const profileData = await stockApi.getCompanyProfile(symbol);

        setQuote(quoteData);
        setProfile(profileData);

        const [
          newsData,
          financialsData,
          recommendationsData,
          priceTargetData,
          earningsData,
        ] = await Promise.allSettled([
          stockApi.getCompanyNews(symbol, dateRange.from, dateRange.to),
          stockApi.getBasicFinancials(symbol),
          stockApi.getRecommendationTrends(symbol),
          stockApi.getPriceTarget(symbol),
          stockApi.getEarnings(symbol),
        ]);

        if (newsData.status === 'fulfilled') setNews(newsData.value);
        if (financialsData.status === 'fulfilled') setFinancials(financialsData.value);
        if (recommendationsData.status === 'fulfilled') setRecommendations(recommendationsData.value);
        if (priceTargetData.status === 'fulfilled') setPriceTarget(priceTargetData.value);
        if (earningsData.status === 'fulfilled') setEarnings(earningsData.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
          <p className="text-gray-400">Loading real-time data for {symbol}...</p>
        </div>
      </div>
    );
  }

  if (!quote || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-red-400 text-lg font-semibold">{error || 'Failed to load data'}</p>
          <p className="text-gray-500">Please check the symbol and try again</p>
        </div>
      </div>
    );
  }

  const isPositive = quote.d > 0;
  const latestRecommendation = recommendations && recommendations.length > 0 ? recommendations[0] : null;
  const totalRecommendations = latestRecommendation
    ? latestRecommendation.strongBuy + latestRecommendation.buy + latestRecommendation.hold + latestRecommendation.sell + latestRecommendation.strongSell
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 space-y-4">
        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm px-4 py-3 rounded-xl">
            Using fallback data: {error}
          </div>
        )}
        <div className="flex items-start justify-between mb-6 flex-col sm:flex-row gap-4">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              {profile.logo && (
                <img src={profile.logo} alt={profile.name} className="w-16 h-16 rounded-xl" />
              )}
              <div>
                <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                <p className="text-gray-400 text-lg">{symbol} • {profile.exchange}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium">
                {profile.finnhubIndustry || profile.country}
              </span>
              <span className="text-gray-500 text-sm">{profile.currency}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white mb-2">
              {stockApi.formatPrice(quote.c)}
            </div>
            <div className={`flex items-center justify-end space-x-2 text-xl font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              <span>{stockApi.formatPrice(Math.abs(quote.d))} ({stockApi.formatPercentage(quote.dp)})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Open</p>
            <p className="text-white text-xl font-semibold">{stockApi.formatPrice(quote.o)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Previous Close</p>
            <p className="text-white text-xl font-semibold">{stockApi.formatPrice(quote.pc)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Day High</p>
            <p className="text-white text-xl font-semibold">{stockApi.formatPrice(quote.h)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Day Low</p>
            <p className="text-white text-xl font-semibold">{stockApi.formatPrice(quote.l)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <StockChart symbol={symbol} />
        </div>

        <div className="space-y-6">
          {priceTarget && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Price Target</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Target High</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {priceTarget.targetHigh ? stockApi.formatPrice(priceTarget.targetHigh) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Target Median</p>
                  <p className="text-white text-2xl font-bold">
                    {priceTarget.targetMedian ? stockApi.formatPrice(priceTarget.targetMedian) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Target Low</p>
                  <p className="text-red-400 text-2xl font-bold">
                    {priceTarget.targetLow ? stockApi.formatPrice(priceTarget.targetLow) : 'N/A'}
                  </p>
                </div>
                {priceTarget.lastUpdated && (
                  <p className="text-gray-500 text-xs mt-2">
                    Updated: {new Date(priceTarget.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {latestRecommendation && totalRecommendations > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Analyst Ratings</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Strong Buy</span>
                  <span className="text-green-400 font-bold">{latestRecommendation.strongBuy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Buy</span>
                  <span className="text-green-400 font-bold">{latestRecommendation.buy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Hold</span>
                  <span className="text-yellow-400 font-bold">{latestRecommendation.hold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sell</span>
                  <span className="text-red-400 font-bold">{latestRecommendation.sell}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Strong Sell</span>
                  <span className="text-red-400 font-bold">{latestRecommendation.strongSell}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-500 text-sm">Total Analysts: {totalRecommendations}</p>
                  {latestRecommendation.period && (
                    <p className="text-gray-500 text-xs mt-1">{latestRecommendation.period}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {financials && financials.metric && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Key Metrics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {financials.metric.peBasicExclExtraTTM && (
              <div>
                <p className="text-gray-400 text-sm mb-1">P/E Ratio (TTM)</p>
                <p className="text-white text-2xl font-bold">{financials.metric.peBasicExclExtraTTM.toFixed(2)}</p>
              </div>
            )}
            {financials.metric.epsBasicExclExtraItemsTTM && (
              <div>
                <p className="text-gray-400 text-sm mb-1">EPS (TTM)</p>
                <p className="text-white text-2xl font-bold">{stockApi.formatPrice(financials.metric.epsBasicExclExtraItemsTTM)}</p>
              </div>
            )}
            {financials.metric.roeTTM && (
              <div>
                <p className="text-gray-400 text-sm mb-1">ROE (TTM)</p>
                <p className="text-white text-2xl font-bold">{financials.metric.roeTTM.toFixed(2)}%</p>
              </div>
            )}
            {financials.metric.roaTTM && (
              <div>
                <p className="text-gray-400 text-sm mb-1">ROA (TTM)</p>
                <p className="text-white text-2xl font-bold">{financials.metric.roaTTM.toFixed(2)}%</p>
              </div>
            )}
            {profile.marketCapitalization && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                <p className="text-white text-2xl font-bold">{stockApi.formatNumber(profile.marketCapitalization * 1000000)}</p>
              </div>
            )}
            {financials.metric.bookValuePerShareAnnual && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Book Value/Share</p>
                <p className="text-white text-2xl font-bold">{stockApi.formatPrice(financials.metric.bookValuePerShareAnnual)}</p>
              </div>
            )}
            {financials.metric.dividendYieldIndicatedAnnual && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Dividend Yield</p>
                <p className="text-white text-2xl font-bold">{financials.metric.dividendYieldIndicatedAnnual.toFixed(2)}%</p>
              </div>
            )}
            {financials.metric['52WeekHigh'] && (
              <div>
                <p className="text-gray-400 text-sm mb-1">52-Week High</p>
                <p className="text-white text-2xl font-bold">{stockApi.formatPrice(financials.metric['52WeekHigh'])}</p>
              </div>
            )}
            {financials.metric['52WeekLow'] && (
              <div>
                <p className="text-gray-400 text-sm mb-1">52-Week Low</p>
                <p className="text-white text-2xl font-bold">{stockApi.formatPrice(financials.metric['52WeekLow'])}</p>
              </div>
            )}
            {financials.metric.beta && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Beta</p>
                <p className="text-white text-2xl font-bold">{financials.metric.beta.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {earnings && earnings.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Recent Earnings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {earnings.slice(0, 4).map((earning, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">{earning.period}</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Actual</span>
                    <span className="text-white font-bold">${earning.actual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Estimate</span>
                    <span className="text-gray-400">${earning.estimate}</span>
                  </div>
                  {earning.surprise !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Surprise</span>
                      <span className={earning.surprise > 0 ? 'text-green-400' : 'text-red-400'}>
                        ${earning.surprise}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {news && news.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Latest News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-500/50"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h4 className="text-white font-semibold text-lg mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {article.headline}
                  </h4>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{article.source}</span>
                    <span className="text-gray-500">
                      {new Date(article.datetime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
