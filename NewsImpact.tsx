import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Brain,
  Clock,
  Flame,
  LineChart,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { getMarketNews, MarketNews } from '../services/stockApi';

type ImpactLevel = 'HIGH' | 'MODERATE' | 'LOW';
type ImpactTilt = 'Bullish' | 'Bearish' | 'Mixed';

interface ImpactStory {
  news: MarketNews;
  level: ImpactLevel;
  tilt: ImpactTilt;
  timeframe: string;
  confidence: number;
  rationale: string;
  drivers: string[];
  sectors: string[];
  tickers: string[];
  aiSummary: string;
}

const levelColorMap: Record<ImpactLevel, string> = {
  HIGH: 'from-[#1f2a44] to-[#141d33] border-rose-400/50',
  MODERATE: 'from-[#1c354e] to-[#162b45] border-amber-300/45',
  LOW: 'from-[#1b2f44] to-[#12263a] border-slate-400/40',
};

const tiltColorMap: Record<ImpactTilt, string> = {
  Bullish: 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/40',
  Bearish: 'text-rose-300 bg-rose-500/10 border border-rose-400/40',
  Mixed: 'text-amber-200 bg-amber-500/10 border border-amber-400/40',
};

function deriveImpact(article: MarketNews): ImpactStory {
  const text = `${article.headline} ${article.summary}`.toLowerCase();

  const has = (...words: string[]) => words.some(w => text.includes(w));

  const sectors = new Set<string>();
  const drivers = new Set<string>();
  const tickers = new Set<string>();

  let level: ImpactLevel = 'MODERATE';
  let tilt: ImpactTilt = 'Mixed';
  let confidence = 70;
  let timeframe = 'Medium-term (3-9 months)';
  let rationale = 'Broader sentiment shift detected; monitor for confirmation across sectors.';

  if (has('earnings beat', 'raises guidance', 'record revenue')) {
    level = 'HIGH';
    tilt = 'Bullish';
    drivers.add('Earnings momentum').add('Forward guidance');
  }

  if (has('miss', 'cuts guidance', 'downgrade', 'weak demand')) {
    level = 'HIGH';
    tilt = 'Bearish';
    drivers.add('Guidance risk').add('Demand softness');
    confidence = 75;
  }

  if (has('inflation', 'cpi', 'ppi', 'price pressure')) {
    level = 'MODERATE';
    drivers.add('Pricing power').add('Input costs');
    sectors.add('Staples').add('Discretionary').add('Materials').add('Energy');
  }

  if (has('rate cut', 'dovish', 'lower rates', 'yield falling')) {
    level = 'HIGH';
    tilt = 'Bullish';
    drivers.add('Cost of capital').add('Liquidity tailwind');
    sectors.add('Growth Tech').add('REITs').add('High beta');
    timeframe = 'Medium-term (6-12 months)';
    confidence = 82;
  }

  if (has('rate hike', 'hawkish', 'higher rates', 'yield rising')) {
    level = 'HIGH';
    tilt = 'Bearish';
    drivers.add('Discount rate shock').add('Credit tightening');
    sectors.add('Financials').add('Banks').add('Value');
    timeframe = 'Short-term (1-3 months)';
    confidence = 82;
  }

  if (has('oil', 'opec', 'crude', 'gasoline')) {
    sectors.add('Energy').add('Airlines').add('Logistics');
    drivers.add('Commodity swing');
    level = level === 'LOW' ? 'MODERATE' : level;
  }

  if (has('chip', 'semiconductor', 'gpu', 'foundry', 'tsmc', 'nvidia', 'ai')) {
    sectors.add('Semiconductors').add('AI Infra').add('Cloud');
    drivers.add('AI capex').add('Supply chain');
    tilt = tilt === 'Mixed' ? 'Bullish' : tilt;
    confidence = Math.max(confidence, 80);
  }

  if (has('geopolitic', 'sanction', 'tariff', 'war', 'conflict', 'border')) {
    level = 'HIGH';
    drivers.add('Policy risk').add('Supply chain');
    tilt = 'Mixed';
    confidence = Math.max(confidence, 78);
  }

  if (has('etf approval', 'etf flows', 'spot etf', 'crypto')) {
    sectors.add('Digital Assets').add('Exchanges').add('Custody');
    drivers.add('Capital inflows');
    tilt = tilt === 'Mixed' ? 'Bullish' : tilt;
    confidence = Math.max(confidence, 76);
  }

  if (has('job', 'employment', 'unemployment', 'labor market')) {
    drivers.add('Labor strength');
    sectors.add('Retail').add('Financials');
    timeframe = 'Short-term (1-2 months)';
  }

  if (has('recall', 'regulator', 'investigation', 'probe')) {
    level = 'HIGH';
    tilt = 'Bearish';
    drivers.add('Headline risk');
    confidence = Math.max(confidence, 80);
  }

  if (has('ipo', 'acquisition', 'merger')) {
    drivers.add('Deal activity');
    tilt = tilt === 'Mixed' ? 'Bullish' : tilt;
    level = level === 'LOW' ? 'MODERATE' : level;
  }

  if (text.includes('btc') || text.includes('bitcoin')) tickers.add('BTC');
  if (text.includes('eth') || text.includes('ethereum')) tickers.add('ETH');
  if (text.includes('nvidia') || text.includes('nvda')) tickers.add('NVDA');
  if (text.includes('tesla') || text.includes('tsla')) tickers.add('TSLA');
  if (text.includes('apple') || text.includes('aapl')) tickers.add('AAPL');
  if (text.includes('microsoft') || text.includes('msft')) tickers.add('MSFT');
  if (text.includes('amazon') || text.includes('amzn')) tickers.add('AMZN');
  if (text.includes('google') || text.includes('googl')) tickers.add('GOOGL');
  if (text.includes('meta')) tickers.add('META');
  if (text.includes('oil') || text.includes('energy')) tickers.add('XLE');

  if (drivers.size === 0) {
    drivers.add('Macro sentiment').add('Positioning shift');
  }

  if (sectors.size === 0) {
    sectors.add('Broad Market');
  }

  const rationalePieces = Array.from(drivers).slice(0, 3);
  rationale = `Key drivers: ${rationalePieces.join(' · ')}. Watch ${Array.from(sectors).join(', ')} for follow-through.`;

  const aiSummary = `${tilt} tone with ${drivers.size ? Array.from(drivers)[0] : 'macro'} in focus. Expect ${level.toLowerCase()} impact ${timeframe.toLowerCase()}. Watch ${Array.from(sectors).slice(0, 2).join(' & ')} for reaction.`;

  return {
    news: article,
    level,
    tilt,
    timeframe,
    confidence,
    rationale,
    drivers: Array.from(drivers),
    sectors: Array.from(sectors),
    tickers: Array.from(tickers).slice(0, 6),
    aiSummary,
  };
}

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Confidence</span>
        <span className="text-teal-300 font-semibold">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800/70 border border-slate-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: ImpactLevel }) {
  const labelMap: Record<ImpactLevel, string> = {
    HIGH: 'High Impact',
    MODERATE: 'Moderate Impact',
    LOW: 'Low Impact',
  };
  return (
    <span className={`text-[11px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-900 border ${levelColorMap[level]}`}>
      {labelMap[level]}
    </span>
  );
}

function TiltBadge({ tilt }: { tilt: ImpactTilt }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${tiltColorMap[tilt]}`}>
      {tilt}
    </span>
  );
}

function formatTime(timestamp: number) {
  try {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Today';
  }
}

export default function NewsImpact() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchImpact = async () => {
      try {
        const news = await getMarketNews('general');

        const majorFilters = [
          'fed',
          'federal reserve',
          'rate cut',
          'rate hike',
          'dovish',
          'hawkish',
          'yields',
          'inflation',
          'cpi',
          'ppi',
          'tariff',
          'trade war',
          'sanction',
          'geopolitic',
          'opec',
          'oil price',
          'energy shock',
          'jobs report',
          'nonfarm',
          'unemployment',
          'labor market',
          'strike',
          'fiscal',
          'spending bill',
          'deficit',
          'shutdown',
        ];

        const isMajor = (article: MarketNews) => {
          const text = `${article.headline} ${article.summary}`.toLowerCase();
          return majorFilters.some(key => text.includes(key));
        };

        const filtered = news.filter(isMajor);
        const sourceList = (filtered.length ? filtered : news.filter(isMajor).concat(news)).slice(0, 12);

        const mapped = sourceList.map(deriveImpact);
        if (mounted) {
          setStories(mapped);
        }
      } catch (error) {
        console.error('Impact load failed', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchImpact();
    const interval = setInterval(fetchImpact, 180000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const summary = useMemo(() => {
    const counts = stories.reduce(
      (acc, s) => {
        acc[s.level] += 1;
        return acc;
      },
      { HIGH: 0, MODERATE: 0, LOW: 0 } as Record<ImpactLevel, number>
    );

    const sectors = stories.flatMap(s => s.sectors);
    const tickers = stories.flatMap(s => s.tickers);
    const topSectors = Array.from(new Set(sectors)).slice(0, 6);
    const topTickers = Array.from(new Set(tickers)).slice(0, 8);

    return { counts, topSectors, topTickers };
  }, [stories]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#0c1930] via-[#102540] to-[#0f3055] border border-[#2b4f7a] rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="p-5 sm:p-7 border-b border-[#2b4f7a]/70 bg-gradient-to-r from-[#0f223c] via-[#11315b] to-[#0f3c70]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-300 via-teal-300 to-emerald-200 rounded-xl shadow-lg shadow-cyan-500/60">
              <Zap className="w-7 h-7 text-[#0a1425]" />
            </div>
            <div className="min-w-0">
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-[0.2em]">Impact Map</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow">Major Market Movers</h3>
              <p className="text-slate-100/90 text-sm mt-1">Tariffs, policy moves, rate shifts, and other big catalysts explained simply for new investors.</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#102b4a]/80 border border-[#2b4f7a] rounded-2xl p-4 shadow-inner shadow-cyan-500/10">
              <div className="flex items-center gap-2 text-slate-100 text-xs font-semibold mb-2">
                <Flame className="w-4 h-4 text-amber-300" />
                Impact Mix
              </div>
              <div className="flex items-center gap-3 text-slate-50 text-sm">
                <span className="text-emerald-200 font-black text-xl">{summary.counts.HIGH}</span>
                <span className="text-slate-200">High</span>
                <span className="text-amber-200 font-black text-xl">{summary.counts.MODERATE}</span>
                <span className="text-slate-200">Moderate</span>
                <span className="text-slate-100 font-black text-xl">{summary.counts.LOW}</span>
                <span className="text-slate-200">Low</span>
              </div>
            </div>

            <div className="bg-[#102b4a]/80 border border-[#2b4f7a] rounded-2xl p-4 shadow-inner shadow-cyan-500/10">
              <div className="flex items-center gap-2 text-slate-100 text-xs font-semibold mb-2">
                <BarChart3 className="w-4 h-4 text-teal-200" />
                Top Sectors in Play
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.topSectors.map((sector) => (
                  <span key={sector} className="px-3 py-1.5 bg-cyan-500/20 text-white text-xs font-semibold rounded-lg border border-cyan-300/40 shadow-sm">
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#102b4a]/80 border border-[#2b4f7a] rounded-2xl p-4 shadow-inner shadow-cyan-500/10">
              <div className="flex items-center gap-2 text-slate-100 text-xs font-semibold mb-2">
                <LineChart className="w-4 h-4 text-emerald-200" />
                Watchlist to Monitor
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.topTickers.map((t) => (
                  <span key={t} className="px-3 py-1.5 bg-emerald-500/20 text-white text-xs font-black rounded-lg border border-emerald-300/40 shadow-sm">
                    ${t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {stories.map((impact, idx) => (
              <div
                key={`${impact.news.id}-${idx}`}
                className={`rounded-2xl border bg-gradient-to-br ${levelColorMap[impact.level]} p-5 sm:p-6 shadow-lg shadow-cyan-500/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-cyan-400/40 hover:backdrop-blur-md text-white`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#102640] border border-[#1b3a63] shadow-inner">
                    {impact.tilt === 'Bullish' && <TrendingUp className="w-5 h-5 text-emerald-300" />}
                    {impact.tilt === 'Bearish' && <TrendingDown className="w-5 h-5 text-rose-300" />}
                    {impact.tilt === 'Mixed' && <Activity className="w-5 h-5 text-amber-300" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <a
                      href={impact.news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-black text-base sm:text-lg leading-tight hover:text-cyan-200 transition-colors line-clamp-2 block"
                    >
                      {impact.news.headline}
                    </a>
                    <p className="text-cyan-100/80 text-sm leading-relaxed line-clamp-2">{impact.aiSummary}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-100/80">
                      <span className="font-semibold text-cyan-100">{impact.news.source}</span>
                      <span>•</span>
                      <span>{formatTime(impact.news.datetime)}</span>
                      <LevelBadge level={impact.level} />
                      <TiltBadge tilt={impact.tilt} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-[12px] text-cyan-50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-300" />
                    <div>
                      <div className="text-cyan-100/70 text-[11px] font-semibold">Timeframe</div>
                      <div className="font-semibold">{impact.timeframe}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-300" />
                    <div className="flex-1">
                      <div className="text-cyan-100/70 text-[11px] font-semibold">Confidence</div>
                      <ConfidenceMeter value={impact.confidence} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-cyan-200 font-bold">
                    <Brain className="w-4 h-4 text-emerald-300" />
                    Why it matters
                  </div>
                  <p className="text-cyan-50 text-sm leading-relaxed">{impact.rationale}</p>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-cyan-100/70 text-[11px] font-bold uppercase tracking-wider">Drivers</div>
                  <div className="flex flex-wrap gap-2">
                    {impact.drivers.map((driver) => (
                      <span key={driver} className="px-3 py-1.5 rounded-lg bg-[#102640] text-cyan-50 text-xs font-semibold border border-[#1b3a63]">
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {impact.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="px-3 py-1.5 bg-[#102640] text-cyan-50 text-xs font-semibold rounded-lg border border-[#1b3a63]"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                  {impact.tickers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {impact.tickers.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-100 text-xs font-black rounded-lg border border-emerald-400/30"
                        >
                          ${t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {stories.length === 0 && (
            <div className="text-center text-cyan-100/80 py-8 text-sm">No major catalysts right now. Check back soon.</div>
          )}
        </div>
      </div>
    </div>
  );
}
