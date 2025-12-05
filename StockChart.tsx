import { useEffect, useMemo, useState } from 'react';
import { getHistoricalData, getStockQuote, HistoricalDataPoint } from '../services/stockApi';
import { Loader2 } from 'lucide-react';

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [baseDailyData, setBaseDailyData] = useState<HistoricalDataPoint[]>([]);

  const aggregateData = (data: HistoricalDataPoint[], tf: 'daily' | 'weekly' | 'monthly') => {
    const clean = data.filter(
      (p) =>
        Number.isFinite(p.open) &&
        Number.isFinite(p.high) &&
        Number.isFinite(p.low) &&
        Number.isFinite(p.close)
    );
    if (tf === 'daily') return clean;
    const buckets = new Map<string, HistoricalDataPoint>();
    clean.forEach((point) => {
      const date = new Date(point.time);
      let key: string;
      if (tf === 'weekly') {
        const firstDayOfWeek = new Date(date);
        const day = firstDayOfWeek.getDay();
        const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        key = firstDayOfWeek.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-01`;
      }

      const existing = buckets.get(key);
      if (!existing) {
        buckets.set(key, { ...point, time: key });
      } else {
        existing.high = Math.max(existing.high, point.high);
        existing.low = Math.min(existing.low, point.low);
        existing.close = point.close;
        existing.volume += point.volume;
      }
    });
    return Array.from(buckets.values()).sort((a, b) => (a.time > b.time ? 1 : -1));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [daily, quote] = await Promise.allSettled([
          getHistoricalData(symbol, 'daily'),
          getStockQuote(symbol),
        ]);

        const dailyData = daily.status === 'fulfilled' ? daily.value : [];
        const quoteData = quote.status === 'fulfilled' ? quote.value : null;

        let merged = dailyData || [];
        const today = new Date().toISOString().split('T')[0];
        const last = merged[merged.length - 1];

        if (quoteData?.c && merged.length > 0 && (!last || last.time !== today)) {
          const close = quoteData.c;
          const open = Number.isFinite(quoteData.o) ? quoteData.o : close;
          const high = Number.isFinite(quoteData.h) ? quoteData.h : Math.max(close, open);
          const low = Number.isFinite(quoteData.l) ? quoteData.l : Math.min(close, open);
          merged = [
            ...merged,
            {
              time: today,
              open,
              high,
              low,
              close,
              volume: 0,
            },
          ];
        }

        setBaseDailyData(merged);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  const dataForView = useMemo(() => aggregateData(baseDailyData, timeframe), [baseDailyData, timeframe]);

  const chartPaths = useMemo(() => {
    if (!dataForView.length) return { line: '', area: '' };
    const width = 1000;
    const height = 360;
    const lows = dataForView.map((d) => d.low).filter(Number.isFinite);
    const highs = dataForView.map((d) => d.high).filter(Number.isFinite);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const range = max - min || 1;

    const points = dataForView.map((d, idx) => {
      const x = (idx / Math.max(dataForView.length - 1, 1)) * width;
      const y = height - ((d.close - min) / range) * height;
      return { x, y };
    });

    if (points.length === 1) {
      points.push({ x: width, y: points[0].y });
    }

    const line = points.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'}${p.x},${p.y} `, '');
    const area =
      line +
      `L${points[points.length - 1].x},${height} L0,${height} Z`;

    return { line: line.trim(), area: area.trim() };
  }, [dataForView]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Price Chart</h3>
        <div className="flex items-center space-x-2">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
            <div className="text-center space-y-2 p-6">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && dataForView.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-100 space-y-3 bg-slate-900/70">
            <div className="px-5 py-2 bg-cyan-500 text-slate-900 rounded-full text-sm font-black shadow-lg shadow-cyan-500/40">
              Coming soon — check back later
            </div>
            <p className="text-slate-300 text-sm max-w-sm text-center">
              We’re finishing the live pricing hookup. Check back shortly for historical and intraday moves.
            </p>
          </div>
        )}

        <svg viewBox="0 0 1000 360" className="w-full h-[360px]">
          <defs>
            <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.3)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
            </linearGradient>
          </defs>
          {chartPaths.area && (
            <path d={chartPaths.area} fill="url(#chartArea)" stroke="none" />
          )}
          {chartPaths.line && (
            <path
              d={chartPaths.line}
              fill="none"
              stroke="#22D3EE"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
