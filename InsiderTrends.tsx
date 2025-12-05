import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, AlertCircle, DollarSign } from 'lucide-react';
import { getInsiderTransactions, InsiderTransaction as ApiInsiderTransaction } from '../services/stockApi';

interface InsiderTransaction {
  name: string;
  position: string;
  transactionType: 'buy' | 'sell';
  shares: number;
  value: number;
  date: string;
}

interface InsiderTrendsProps {
  symbol: string;
}

export default function InsiderTrends({ symbol }: InsiderTrendsProps) {
  const [transactions, setTransactions] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');

  useEffect(() => {
    const fetchInsiderData = async () => {
      setLoading(true);
      try {
        const apiTransactions = await getInsiderTransactions(symbol);

        const parseNameAndPosition = (raw: string | undefined) => {
          const safe = (raw || '').trim();
          if (!safe) return { name: 'Unknown', position: 'Insider' };
          const bulletSplit = safe.split('•');
          const commaSplit = safe.split(',');
          const dashSplit = safe.split(' - ');

          if (bulletSplit.length === 2) {
            return { name: bulletSplit[0].trim(), position: bulletSplit[1].trim() || 'Insider' };
          }
          if (commaSplit.length === 2) {
            return { name: commaSplit[0].trim(), position: commaSplit[1].trim() || 'Insider' };
          }
          if (dashSplit.length === 2) {
            return { name: dashSplit[0].trim(), position: dashSplit[1].trim() || 'Insider' };
          }
          return { name: safe, position: 'Insider' };
        };

        const formattedTransactions: InsiderTransaction[] = apiTransactions.map((tx: ApiInsiderTransaction) => {
          const { name, position } = parseNameAndPosition(tx.name);
          const isBuy = (tx.transactionCode || '').toUpperCase() === 'P' || tx.change > 0;
          const shares = Math.abs(tx.share || tx.change || 0);
          const value = Math.max(0, shares * tx.transactionPrice);

          return {
            name,
            position,
            transactionType: isBuy ? 'buy' : 'sell',
            shares,
            value,
            date: tx.transactionDate || tx.filingDate
          };
        });

        setTransactions(formattedTransactions);

        const buys = formattedTransactions.filter(t => t.transactionType === 'buy');
        const sells = formattedTransactions.filter(t => t.transactionType === 'sell');
        const buyValue = buys.reduce((sum, t) => sum + t.value, 0);
        const sellValue = sells.reduce((sum, t) => sum + t.value, 0);

        if (buyValue > sellValue * 2) {
          setSentiment('bullish');
        } else if (sellValue > buyValue * 2) {
          setSentiment('bearish');
        } else {
          setSentiment('neutral');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching insider data:', error);
        setLoading(false);
      }
    };

    fetchInsiderData();
  }, [symbol]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatShares = (shares: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(shares);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'bullish':
        return {
          color: 'teal',
          icon: TrendingUp,
          label: 'Bullish',
          description: 'Strong insider buying activity'
        };
      case 'bearish':
        return {
          color: 'rose',
          icon: TrendingDown,
          label: 'Bearish',
          description: 'Notable insider selling activity'
        };
      default:
        return {
          color: 'amber',
          icon: AlertCircle,
          label: 'Neutral',
          description: 'Mixed insider activity'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const config = getSentimentConfig();
  const Icon = config.icon;

  const buyTransactions = transactions.filter(t => t.transactionType === 'buy');
  const sellTransactions = transactions.filter(t => t.transactionType === 'sell');
  const totalBuyValue = buyTransactions.reduce((sum, t) => sum + t.value, 0);
  const totalSellValue = sellTransactions.reduce((sum, t) => sum + t.value, 0);
  const netValue = totalBuyValue - totalSellValue;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="border-b border-slate-800 px-6 sm:px-8 py-5 bg-slate-900/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Insider Trading Activity</h3>
            </div>
            <p className="text-slate-400 text-sm sm:text-base">Recent transactions by company insiders</p>
          </div>
          <div className={`px-4 py-2 rounded-xl bg-${config.color}-500/20 border border-${config.color}-500/30 flex items-center gap-2`}>
            <Icon className={`w-5 h-5 text-${config.color}-400`} />
            <div>
              <div className={`text-sm font-black text-${config.color}-400`}>{config.label}</div>
              <div className="text-xs text-slate-400">{config.description}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 text-sm font-bold">Total Buys</span>
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalBuyValue)}</div>
            <div className="text-xs text-slate-400 mt-1">{buyTransactions.length} transaction(s)</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-sm font-bold">Total Sells</span>
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalSellValue)}</div>
            <div className="text-xs text-slate-400 mt-1">{sellTransactions.length} transaction(s)</div>
          </div>
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`w-4 h-4 ${netValue >= 0 ? 'text-teal-300' : 'text-rose-300'}`} />
              <span className={`text-sm font-bold ${netValue >= 0 ? 'text-teal-200' : 'text-rose-200'}`}>
                Net {netValue >= 0 ? 'Buying' : 'Selling'}
              </span>
            </div>
            <div className={`text-2xl font-black ${netValue >= 0 ? 'text-teal-100' : 'text-rose-100'}`}>
              {formatCurrency(Math.abs(netValue))}
            </div>
            <div className="text-xs text-slate-400 mt-1">Buy minus sell dollar volume</div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className={`p-4 sm:p-5 rounded-xl border transition-all hover:scale-[1.01] ${
                transaction.transactionType === 'buy'
                  ? 'bg-teal-500/5 border-teal-500/20 hover:bg-teal-500/10'
                  : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      transaction.transactionType === 'buy' ? 'bg-teal-500/20' : 'bg-rose-500/20'
                    }`}>
                      {transaction.transactionType === 'buy' ? (
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm sm:text-base">{transaction.name}</span>
                        <span className="text-slate-500">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs sm:text-sm">
                          <Building2 className="w-3 h-3" />
                          {transaction.position}
                        </div>
                      </div>
                      <div className="text-slate-500 text-xs mt-1">{getRelativeTime(transaction.date)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Shares</div>
                      <div className="text-white font-bold text-sm sm:text-base">{formatShares(transaction.shares)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Value
                      </div>
                      <div className={`font-black text-sm sm:text-base ${
                        transaction.transactionType === 'buy' ? 'text-teal-400' : 'text-rose-400'
                      }`}>
                        {formatCurrency(transaction.value)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  transaction.transactionType === 'buy'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {transaction.transactionType.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No recent insider transactions available</p>
          </div>
        )}
      </div>
    </div>
  );
}
