import { useEffect, useMemo, useState } from 'react';
import { Rocket, PlusCircle, MinusCircle, AlertTriangle, LineChart, Info } from 'lucide-react';
import { getHistoricalData, getStockQuote } from '../services/stockApi';
import { useAuth } from '../context/AuthContext';

type Position = {
  symbol: string;
  side: 'LONG' | 'SHORT';
  qty: number;
  price: number;
  last?: number;
};

type OrderType = 'Market' | 'Limit';

type SparkPoint = number | { v: number; t?: number };

function Sparkline({ points, height = 120, flash }: { points: SparkPoint[]; height?: number; flash?: boolean }) {
  if (!points.length) return null;
  const width = 480;
  const normalized = points.map((p) => (typeof p === 'number' ? { v: p } : p));
  const values = normalized.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const change = values.length > 1 ? values[values.length - 1] - values[0] : 0;
  const stroke = change >= 0 ? '#22D3EE' : '#F472B6';
  const pts = values.map((p, idx) => {
      const x = (idx / Math.max(points.length - 1, 1)) * width;
      const y = height - ((p - min) / range) * height;
      return { x, y };
    });
  const path = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full h-28 ${flash ? 'animate-flash-soft' : ''}`}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const idx = Math.min(
            pts.length - 1,
            Math.max(0, Math.round((x / width) * (pts.length - 1)))
          );
          setHoverIdx(idx);
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="equityArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* minor grid lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={0}
            x2={width}
            y1={height - p * height}
            y2={height - p * height}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}
        <line x1={0} x2={width} y1={height - 20} y2={height - 20} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        {path && (
          <>
            <path d={`${path} L ${width},${height} L 0,${height} Z`} fill="url(#equityArea)" stroke="none" />
            <path d={path} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {pts.length > 0 && (
              <circle
                cx={pts[pts.length - 1].x}
                cy={pts[pts.length - 1].y}
                r={4}
                fill={stroke}
                stroke="white"
                strokeWidth={1.5}
              />
            )}
          </>
        )}
        {hoverIdx !== null && pts[hoverIdx] && (
          <>
            <line
              x1={pts[hoverIdx].x}
              x2={pts[hoverIdx].x}
              y1={0}
              y2={height}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3 4"
            />
            <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r={5} fill={stroke} stroke="white" strokeWidth={1.2} />
          </>
        )}
      </svg>
      {hoverIdx !== null && normalized[hoverIdx] && (
        <div
          className="absolute px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white shadow-lg"
          style={{
            left: `${Math.min(100, (pts[hoverIdx].x / width) * 100)}%`,
            top: 4,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold">
            $
            {normalized[hoverIdx].v.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {normalized[hoverIdx].t && (
            <div className="text-[10px] text-slate-400">
              {new Date(normalized[hoverIdx].t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaperTrading() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [quote, setQuote] = useState<{ price: number; change: number } | null>(null);
  const [sparkPoints, setSparkPoints] = useState<number[]>([]);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [rowHighlight, setRowHighlight] = useState<string | null>(null);
  const [equityHistory, setEquityHistory] = useState<Array<{ t: number; v: number }>>([]);

  const equity = useMemo(() => {
    return positions.reduce((acc, p) => {
      const last = p.last ?? p.price;
      const value = p.side === 'LONG' ? p.qty * last : p.qty * (2 * p.price - last);
      return acc + value;
    }, balance);
  }, [positions, balance]);

  const totalPL = useMemo(() => {
    return positions.reduce((acc, p) => {
      const last = p.last ?? p.price;
      const pnl = p.side === 'LONG' ? (last - p.price) * p.qty : (p.price - last) * p.qty;
      return acc + pnl;
    }, 0);
  }, [positions]);

  const marketValue = useMemo(() => {
    return positions.reduce((acc, p) => {
      const last = p.last ?? p.price;
      return acc + last * p.qty;
    }, 0);
  }, [positions]);

  const buyingPower = balance * 2;

  // Persist per-user state (local device for now).
  const storageKey = (user?.id ?? 'guest') + ':paper_trading';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.balance === 'number') setBalance(parsed.balance);
        if (Array.isArray(parsed.positions)) setPositions(parsed.positions);
        if (Array.isArray(parsed.equityHistory)) setEquityHistory(parsed.equityHistory);
      } catch {
        // ignore
      }
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = JSON.stringify({ balance, positions, equityHistory });
    localStorage.setItem(storageKey, payload);
  }, [balance, positions, equityHistory, storageKey, hydrated]);

  // Keep a short history of equity to render sparkline accurately from user trades.
  useEffect(() => {
    if (!hydrated) return;
    setEquityHistory((prev) => {
      const nextPoint = { t: Date.now(), v: parseFloat(equity.toFixed(2)) };
      // avoid duplicate consecutive entries
      if (prev.length && prev[prev.length - 1].v === nextPoint.v) return prev;
      const next = [...prev, nextPoint];
      // keep last 60 points
      return next.slice(-60);
    });
  }, [equity, hydrated]);

  useEffect(() => {
    let active = true;
    const fetchQuote = async () => {
      if (!symbol.trim()) {
        setQuote(null);
        setSparkPoints([]);
        return;
      }
      setLoadingQuote(true);
      try {
        const [q, hist] = await Promise.all([
          getStockQuote(symbol.trim().toUpperCase()),
          getHistoricalData(symbol.trim().toUpperCase(), 'daily'),
        ]);
        if (!active) return;
        setQuote({ price: q.c, change: q.dp });
        const pts = hist.slice(-10).map((h) => h.close);
        if (pts.length) setSparkPoints(pts);
      } catch {
        if (active) {
          setQuote(null);
          setSparkPoints([]);
        }
      } finally {
        if (active) setLoadingQuote(false);
      }
    };
    fetchQuote();
    return () => {
      active = false;
    };
  }, [symbol]);

  useEffect(() => {
    const updateLastPrices = async () => {
      const syms = Array.from(new Set(positions.map((p) => p.symbol)));
      const quotes = await Promise.all(
        syms.map(async (s) => {
          try {
            const q = await getStockQuote(s);
            return { symbol: s, price: q.c };
          } catch {
            return { symbol: s, price: null };
          }
        })
      );
      setPositions((prev) =>
        prev.map((p) => {
          const q = quotes.find((q) => q.symbol === p.symbol);
          return q && q.price ? { ...p, last: q.price } : p;
        })
      );
    };
    if (positions.length) {
      updateLastPrices();
      const id = setInterval(updateLastPrices, 60000);
      return () => clearInterval(id);
    }
  }, [positions.length]);

  const addPosition = (side: 'LONG' | 'SHORT') => {
    const sym = symbol.trim().toUpperCase();
    const tradePrice = orderType === 'Market' ? quote?.price ?? price : price;
    if (!sym) {
      setFormError('Symbol required');
      return;
    }
    if (qty <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }
    if (orderType === 'Market' && !quote) {
      setFormError('Live quote required for market order');
      return;
    }
    if (!tradePrice || tradePrice <= 0) {
      setFormError(orderType === 'Limit' ? 'Enter a valid limit price' : 'Waiting for price');
      return;
    }
    const cost = qty * tradePrice;
    if (side === 'LONG' && cost > balance) {
      setFormError('Not enough cash for this order');
      return;
    }
    setFormError(null);
    if (side === 'LONG') setBalance((b) => b - cost);
    setPositions((p) => [...p, { symbol: sym, side, qty, price: tradePrice, last: tradePrice }]);
    setFlashKey((k) => k + 1);
    setRowHighlight(`${sym}-${Date.now()}`);
    setSymbol('');
    setQty(0);
    setPrice(0);
  };

  const closePosition = (index: number) => {
    const pos = positions[index];
    const last = pos.last ?? pos.price;
    const proceeds = pos.qty * last;
    if (pos.side === 'LONG') setBalance((b) => b + proceeds);
    setPositions(positions.filter((_, i) => i !== index));
    setFlashKey((k) => k + 1);
    setRowHighlight(`${pos.symbol}-${Date.now()}`);
  };

  const openPL = (p: Position) => {
    const last = p.last ?? p.price;
    const pnl = p.side === 'LONG' ? (last - p.price) * p.qty : (p.price - last) * p.qty;
    const pct = (pnl / (p.price * p.qty)) * 100;
    return { pnl, pct, last };
  };

  const symbolClean = symbol.trim().toUpperCase();
  const hasQuote = Boolean(quote);
  const isSymbolEntered = Boolean(symbolClean);
  const canTrade =
    isSymbolEntered &&
    qty > 0 &&
    (orderType === 'Market' ? hasQuote : price > 0);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl px-4 py-3 flex items-center gap-3 text-rose-100 text-sm shadow-lg shadow-rose-500/20">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-semibold">Breaking News: Paper trading only — tap to open News tab for live headlines.</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 shadow-2xl shadow-cyan-500/20 backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40">
              <Rocket className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Total Equity</p>
              <h3 className={`text-3xl font-black text-white transition-all duration-500 ${flashKey ? 'animate-flash-soft' : ''}`}>
                {formatCurrency(equity)}
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Metric label="Market Value" value={formatCurrency(marketValue)} flash={flashKey} />
            <Metric label="Cash" value={formatCurrency(balance)} flash={flashKey} />
            <Metric label="Buying Power" value={formatCurrency(buyingPower)} />
            <Metric label="Today P/L" value={formatCurrency(0)} tone="flat" />
            <Metric
              label="Total P/L"
              subLabel="All Time"
              value={formatCurrency(totalPL)}
              tone={totalPL >= 0 ? 'pos' : 'neg'}
              flash={flashKey}
            />
            <Metric label="Positions" value={`${positions.length}`} />
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Currently showing unrealized P/L; realized tracking planned for closed trades.</span>
            <span className={user ? 'text-emerald-300' : 'text-cyan-300'}>
              {user ? 'Synced to your account' : (
                <button className="underline underline-offset-2 decoration-dotted text-cyan-300 hover:text-cyan-200">Sign in to sync across devices.</button>
              )}
            </span>
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold mb-2">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-300" />
              <span>Equity • 1D</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-slate-700/70 text-[10px] font-semibold text-slate-100">1D</span>
              <span className="text-slate-200 font-bold">{formatCurrency(equity)}</span>
            </div>
          </div>
          <div className={`${flashKey ? 'animate-flash-soft' : ''}`}>
            <Sparkline
              points={(equityHistory.length ? equityHistory : [{ v: equity, t: Date.now() }])}
              height={120}
              flash
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-white">Place Trade</h4>
            <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-semibold">Paper Only</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol"
              className={`px-3 py-2 rounded-lg bg-slate-800 border text-white transition-colors ${
                !symbol && formError ? 'border-rose-400/70' : 'border-slate-700'
              }`}
            />
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              placeholder="Quantity"
              className={`px-3 py-2 rounded-lg bg-slate-800 border text-white transition-colors ${
                qty <= 0 && formError ? 'border-rose-400/70' : 'border-slate-700'
              }`}
            />
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            >
              <option>Market</option>
              <option>Limit</option>
            </select>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder={orderType === 'Limit' ? 'Limit price (USD)' : 'Market price (ignored)'}
              className={`px-3 py-2 rounded-lg border text-white transition-colors ${
                orderType === 'Limit'
                  ? 'bg-slate-800 border-cyan-400/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  : 'bg-slate-800 border-slate-700/60 text-slate-500 cursor-not-allowed'
              }`}
              disabled={orderType === 'Market'}
            />
            <div className="col-span-1 md:col-span-4 flex gap-2">
              <button
                onClick={() => addPosition('LONG')}
                disabled={!canTrade}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold border transition-all ${
                  canTrade
                    ? 'bg-emerald-500 text-slate-900 border-emerald-400 hover:bg-emerald-400'
                    : 'bg-emerald-500/30 text-emerald-100/60 border-emerald-400/30 cursor-not-allowed'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Buy
              </button>
              <button
                onClick={() => addPosition('SHORT')}
                disabled={!canTrade}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold border transition-all ${
                  canTrade
                    ? 'bg-rose-500/20 text-rose-100 border-rose-400/50 hover:bg-rose-500/30'
                    : 'bg-rose-500/10 text-rose-100/50 border-rose-400/20 cursor-not-allowed'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                Short
              </button>
            </div>
            <div className="col-span-1 md:col-span-4 text-xs text-slate-500">
              Simulated trades only. Market orders ignore the limit price field.
            </div>
            {formError && (
              <div className="col-span-1 md:col-span-4 flex items-center gap-2 text-sm text-rose-300">
                <Info className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-white">
              <span className="font-semibold">Live Quote</span>
              {loadingQuote && <span className="text-xs text-slate-400">Loading…</span>}
            </div>
            {quote ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-semibold">{symbolClean}</span>
                  <span className="text-2xl font-black text-white">${quote.price.toFixed(2)}</span>
                </div>
                <div className={`text-xs font-semibold ${quote.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}%
                </div>
                {sparkPoints.length > 0 && <Sparkline points={sparkPoints} height={64} />}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Enter a valid symbol to see live price and sparkline.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10">
        <h4 className="text-lg font-bold text-white">Open Positions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-100">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Side</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Avg Price</th>
                <th className="text-right py-2">Last Price</th>
                <th className="text-right py-2">Unrealized P/L</th>
                <th className="text-right py-2">P/L %</th>
                <th className="text-right py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 text-sm bg-slate-800/60 border border-slate-700 rounded-xl">
                    No open simulated positions. Place a trade to get started.
                  </td>
                </tr>
              ) : (
                positions.map((pos, idx) => {
                  const { pnl, pct, last } = openPL(pos);
                  const highlight = rowHighlight && pos.symbol === rowHighlight.split('-')[0];
                  return (
                    <tr
                      key={`${pos.symbol}-${idx}`}
                      className={`border-b border-slate-800/70 transition-all ${
                        highlight ? 'animate-fade-in bg-slate-800/50' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-3">{pos.symbol}</td>
                      <td className="py-3 text-left text-slate-300">{pos.side}</td>
                      <td className="py-3 text-right">{pos.qty}</td>
                      <td className="py-3 text-right">{formatCurrency(pos.price)}</td>
                      <td className="py-3 text-right">{formatCurrency(last)}</td>
                      <td className={`py-3 text-right ${pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatCurrency(pnl)}</td>
                      <td className={`py-3 text-right ${pct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{pct.toFixed(2)}%</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => closePosition(idx)}
                          className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs hover:border-cyan-400/50 transition-all"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, subLabel, value, tone = 'flat', flash }: { label: string; subLabel?: string; value: string; tone?: 'pos' | 'neg' | 'flat'; flash?: number }) {
  const color = tone === 'pos' ? 'text-emerald-300' : tone === 'neg' ? 'text-rose-300' : 'text-white';
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-xl p-3 shadow-inner shadow-slate-900/30 transition-all ${flash ? 'animate-flash-soft' : ''}`}>
      <p className="text-xs text-slate-400">{label}</p>
      {subLabel && <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{subLabel}</p>}
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
