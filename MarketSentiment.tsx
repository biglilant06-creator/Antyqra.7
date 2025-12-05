import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { getMarketIndices, getStockQuote } from '../services/stockApi';

export default function MarketSentiment() {
  const [sentiment, setSentiment] = useState({
    overall: 'neutral',
    score: 50,
    bullish: 55,
    bearish: 45,
    fearGreedIndex: 52
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const [indices, vixQuote] = await Promise.all([
          getMarketIndices(),
          getStockQuote('VIX').catch(() => null),
        ]);

        const safeDp = (dp: number) => (Number.isFinite(dp) ? dp : 0);
        const spx = safeDp(indices.sp500.dp);
        const ndx = safeDp(indices.nasdaq.dp);
        const dow = safeDp(indices.dow.dp);
        const vix = vixQuote?.c && Number.isFinite(vixQuote.c) ? vixQuote.c : null;

        const avgChange = (spx * 0.5 + ndx * 0.35 + dow * 0.15);

        // Adjust sentiment with VIX: higher VIX leans bearish.
        const vixPenalty = vix ? Math.min(Math.max((vix - 15) * 0.6, -10), 10) : 0;

        let overall = 'neutral';
        let score = 50;

        const baseScore = 50 + avgChange * 6 - vixPenalty;
        score = Math.max(0, Math.min(100, baseScore));

        if (score >= 70) overall = 'very-bullish';
        else if (score >= 55) overall = 'bullish';
        else if (score <= 30) overall = 'very-bearish';
        else if (score <= 45) overall = 'bearish';
        else overall = 'neutral';

        const bullish = Math.min(Math.max(50 + avgChange * 5 - vixPenalty, 0), 100);
        const bearish = 100 - bullish;
        const fearGreedIndex = score;

        setSentiment({
          overall,
          score: Math.round(score),
          bullish: Math.round(bullish),
          bearish: Math.round(bearish),
          fearGreedIndex: Math.round(fearGreedIndex)
        });
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchSentiment();
    const interval = setInterval(fetchSentiment, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = () => {
    switch (sentiment.overall) {
      case 'very-bullish':
      case 'bullish':
        return 'from-teal-500 to-emerald-500';
      case 'bearish':
      case 'very-bearish':
        return 'from-rose-500 to-red-500';
      default:
        return 'from-amber-500 to-orange-500';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment.overall) {
      case 'very-bullish':
      case 'bullish':
        return <TrendingUp className="w-12 h-12" />;
      case 'very-bearish':
      case 'bearish':
        return <TrendingDown className="w-12 h-12" />;
      default:
        return <Minus className="w-12 h-12" />;
    }
  };

  const getSentimentText = () => {
    switch (sentiment.overall) {
      case 'very-bullish':
        return 'Extremely Bullish';
      case 'bullish':
        return 'Bullish';
      case 'neutral':
        return 'Neutral';
      case 'bearish':
        return 'Bearish';
      case 'very-bearish':
        return 'Extremely Bearish';
      default:
        return 'Neutral';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="h-48 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-5 bg-slate-900/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">Market Sentiment</h3>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">Real-time market analysis</p>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-500/20 border border-rose-500/30 rounded-full animate-pulse">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400 fill-rose-400" />
            <span className="text-rose-400 text-xs sm:text-sm font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className={`relative p-6 sm:p-8 lg:p-10 bg-gradient-to-br ${getSentimentColor()} rounded-2xl shadow-2xl overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/90 font-bold text-lg">Overall Sentiment</span>
                <div className="text-white">
                  {getSentimentIcon()}
                </div>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">{getSentimentText()}</div>
              <div className="text-3xl sm:text-4xl font-black text-white/90">{sentiment.score}<span className="text-xl sm:text-2xl">/100</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-teal-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                  <span className="font-bold text-white text-lg">Bullish</span>
                </div>
                <span className="text-teal-400 text-4xl font-black">{sentiment.bullish}%</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-teal-500/50"
                  style={{ width: `${sentiment.bullish}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-rose-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-6 h-6 text-rose-400" />
                  <span className="font-bold text-white text-lg">Bearish</span>
                </div>
                <span className="text-rose-400 text-4xl font-black">{sentiment.bearish}%</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-1000 shadow-lg shadow-rose-500/50"
                  style={{ width: `${sentiment.bearish}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white text-lg">Fear & Greed Index</span>
                <span className="text-5xl font-black text-white">{sentiment.fearGreedIndex}</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sentiment.fearGreedIndex > 50 ? 'bg-gradient-to-r from-teal-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-red-500'} rounded-full transition-all duration-1000 shadow-lg`}
                  style={{ width: `${sentiment.fearGreedIndex}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-xs text-slate-400 font-semibold">
                <span>Extreme Fear</span>
                <span>Extreme Greed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
