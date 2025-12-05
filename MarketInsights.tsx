import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Globe, AlertCircle, Activity, Zap, Building2 } from 'lucide-react';
import { getMarketNews } from '../services/stockApi';

interface Insight {
  icon: typeof TrendingUp;
  title: string;
  description: string;
  impact: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  sector: string;
  confidence: number;
}

export default function MarketInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        const news = await getMarketNews('general');
        const topNews = news.slice(0, 12);

        const analysisResults: Record<string, { count: number; sentiment: number; headlines: string[] }> = {
          tech: { count: 0, sentiment: 0, headlines: [] },
          rates: { count: 0, sentiment: 0, headlines: [] },
          earnings: { count: 0, sentiment: 0, headlines: [] },
          global: { count: 0, sentiment: 0, headlines: [] },
          energy: { count: 0, sentiment: 0, headlines: [] },
          crypto: { count: 0, sentiment: 0, headlines: [] },
          retail: { count: 0, sentiment: 0, headlines: [] },
          employment: { count: 0, sentiment: 0, headlines: [] }
        };

        topNews.forEach(article => {
          const content = (article.headline + ' ' + article.summary).toLowerCase();

          if (content.match(/\b(ai|tech|chip|semiconductor|nvidia|apple|microsoft|google|meta)\b/)) {
            analysisResults.tech.count++;
            analysisResults.tech.sentiment += (
              content.match(/\b(surge|rally|gain|beat|strong|boom|growth)\b/) ? 1 :
              content.match(/\b(drop|fall|decline|weak|loss|crash)\b/) ? -1 : 0
            );
            analysisResults.tech.headlines.push(article.headline);
          }

          if (content.match(/\b(fed|federal reserve|interest rate|inflation|cpi|powell)\b/)) {
            analysisResults.rates.count++;
            analysisResults.rates.sentiment += (
              content.match(/\b(cut|lower|dovish|ease)\b/) ? 1 :
              content.match(/\b(hike|raise|hawkish|tighten)\b/) ? -1 : 0
            );
            analysisResults.rates.headlines.push(article.headline);
          }

          if (content.match(/\b(earnings|revenue|profit|quarterly|eps|guidance)\b/)) {
            analysisResults.earnings.count++;
            analysisResults.earnings.sentiment += (
              content.match(/\b(beat|exceed|strong|record|surge)\b/) ? 1 :
              content.match(/\b(miss|disappoint|weak|decline)\b/) ? -1 : 0
            );
            analysisResults.earnings.headlines.push(article.headline);
          }

          if (content.match(/\b(china|europe|asia|global|international|emerging)\b/)) {
            analysisResults.global.count++;
            analysisResults.global.sentiment += (
              content.match(/\b(growth|expansion|recovery|strong)\b/) ? 1 :
              content.match(/\b(slowdown|recession|crisis|tension)\b/) ? -1 : 0
            );
            analysisResults.global.headlines.push(article.headline);
          }

          if (content.match(/\b(oil|energy|crude|opec|gas|petroleum)\b/)) {
            analysisResults.energy.count++;
            analysisResults.energy.sentiment += (
              content.match(/\b(surge|rally|spike|rise)\b/) ? 1 :
              content.match(/\b(plunge|drop|decline|fall)\b/) ? -1 : 0
            );
            analysisResults.energy.headlines.push(article.headline);
          }

          if (content.match(/\b(bitcoin|crypto|ethereum|blockchain|digital asset)\b/)) {
            analysisResults.crypto.count++;
            analysisResults.crypto.sentiment += (
              content.match(/\b(rally|surge|boom|adoption|bullish)\b/) ? 1 :
              content.match(/\b(crash|decline|bearish|regulate)\b/) ? -1 : 0
            );
            analysisResults.crypto.headlines.push(article.headline);
          }

          if (content.match(/\b(retail|consumer|shopping|spending|walmart|amazon)\b/)) {
            analysisResults.retail.count++;
            analysisResults.retail.sentiment += (
              content.match(/\b(strong|surge|growth|record)\b/) ? 1 :
              content.match(/\b(weak|decline|slow|pressure)\b/) ? -1 : 0
            );
            analysisResults.retail.headlines.push(article.headline);
          }

          if (content.match(/\b(employment|jobs|unemployment|wage|labor|hiring)\b/)) {
            analysisResults.employment.count++;
            analysisResults.employment.sentiment += (
              content.match(/\b(gain|growth|strong|increase)\b/) ? 1 :
              content.match(/\b(loss|decline|weak|layoff)\b/) ? -1 : 0
            );
            analysisResults.employment.headlines.push(article.headline);
          }
        });

        const generatedInsights: Insight[] = [];

        if (analysisResults.tech.count >= 2) {
          const avgSentiment = analysisResults.tech.sentiment / analysisResults.tech.count;
          const impact = avgSentiment > 0.3 ? 'bullish' : avgSentiment < -0.3 ? 'bearish' : 'neutral';
          generatedInsights.push({
            icon: Building2,
            title: avgSentiment > 0.3 ? 'Tech Sector Momentum Builds' : avgSentiment < -0.3 ? 'Tech Faces Headwinds' : 'Tech Sector Mixed Signals',
            description: avgSentiment > 0.3
              ? 'AI innovation and semiconductor demand driving major tech stocks higher. Cloud infrastructure spending remains robust.'
              : avgSentiment < -0.3
              ? 'Tech valuations under pressure from regulatory concerns and macro headwinds. Sector rotation evident.'
              : 'Technology stocks showing divergence with AI leaders outperforming while legacy hardware faces challenges.',
            impact,
            sector: 'Technology',
            confidence: Math.min(70 + (analysisResults.tech.count * 5), 95)
          });
        }

        if (analysisResults.rates.count >= 2) {
          const avgSentiment = analysisResults.rates.sentiment / analysisResults.rates.count;
          const impact = avgSentiment > 0.2 ? 'bullish' : avgSentiment < -0.2 ? 'bearish' : 'neutral';
          generatedInsights.push({
            icon: DollarSign,
            title: avgSentiment > 0.2 ? 'Fed Signals Rate Cuts Ahead' : avgSentiment < -0.2 ? 'Fed Maintains Hawkish Stance' : 'Fed Policy Remains Data-Dependent',
            description: avgSentiment > 0.2
              ? 'Central bank signaling potential rate cuts as inflation cools. Growth stocks and real estate positioned to benefit.'
              : avgSentiment < -0.2
              ? 'Persistent inflation concerns keeping rates elevated. Banks benefit while growth stocks face valuation pressure.'
              : 'Federal Reserve balancing inflation control with growth concerns. Markets pricing in gradual policy adjustments.',
            impact,
            sector: 'Monetary Policy',
            confidence: Math.min(75 + (analysisResults.rates.count * 5), 98)
          });
        }

        if (analysisResults.earnings.count >= 2) {
          const avgSentiment = analysisResults.earnings.sentiment / analysisResults.earnings.count;
          const impact = avgSentiment > 0.3 ? 'bullish' : avgSentiment < -0.3 ? 'bearish' : 'mixed';
          generatedInsights.push({
            icon: AlertCircle,
            title: avgSentiment > 0.3 ? 'Earnings Beats Drive Optimism' : avgSentiment < -0.3 ? 'Earnings Misses Weigh on Markets' : 'Mixed Earnings Picture Emerges',
            description: avgSentiment > 0.3
              ? 'Corporate results surpassing expectations with strong guidance. Profit margins resilient despite economic uncertainty.'
              : avgSentiment < -0.3
              ? 'Earnings disappointments mounting as companies face margin pressure and cautious outlooks dominate.'
              : 'Earnings season revealing sector divergence. Consumer strength offsetting manufacturing weakness.',
            impact,
            sector: 'Earnings',
            confidence: Math.min(80 + (analysisResults.earnings.count * 3), 92)
          });
        }

        if (analysisResults.global.count >= 2) {
          const avgSentiment = analysisResults.global.sentiment / analysisResults.global.count;
          const impact = avgSentiment > 0.2 ? 'bullish' : avgSentiment < -0.2 ? 'bearish' : 'mixed';
          generatedInsights.push({
            icon: Globe,
            title: avgSentiment > 0.2 ? 'Global Growth Accelerates' : avgSentiment < -0.2 ? 'International Headwinds Mount' : 'Mixed Global Economic Signals',
            description: avgSentiment > 0.2
              ? 'International markets strengthening on recovery momentum. Emerging markets attracting capital flows.'
              : avgSentiment < -0.2
              ? 'Geopolitical tensions and trade concerns creating volatility in international markets. Safe-haven flows increasing.'
              : 'Global markets diverging with regional strength in Asia while European growth stalls. Trade dynamics evolving.',
            impact,
            sector: 'Global Markets',
            confidence: Math.min(65 + (analysisResults.global.count * 5), 88)
          });
        }

        if (analysisResults.energy.count >= 2) {
          const avgSentiment = analysisResults.energy.sentiment / analysisResults.energy.count;
          const impact = avgSentiment > 0.3 ? 'bullish' : avgSentiment < -0.3 ? 'bearish' : 'neutral';
          generatedInsights.push({
            icon: Zap,
            title: avgSentiment > 0.3 ? 'Energy Sector Rallies' : avgSentiment < -0.3 ? 'Energy Prices Under Pressure' : 'Oil Markets Stabilizing',
            description: avgSentiment > 0.3
              ? 'Crude prices surging on supply constraints and demand recovery. Energy stocks outperforming broader market.'
              : avgSentiment < -0.3
              ? 'Oil decline benefiting airlines and consumers while pressuring energy producers. Oversupply concerns persist.'
              : 'Energy markets balancing OPEC production decisions with demand outlook. Range-bound trading expected.',
            impact,
            sector: 'Energy',
            confidence: Math.min(75 + (analysisResults.energy.count * 4), 90)
          });
        }

        if (analysisResults.retail.count >= 2) {
          const avgSentiment = analysisResults.retail.sentiment / analysisResults.retail.count;
          const impact = avgSentiment > 0.3 ? 'bullish' : avgSentiment < -0.3 ? 'bearish' : 'mixed';
          generatedInsights.push({
            icon: Activity,
            title: avgSentiment > 0.3 ? 'Consumer Spending Remains Strong' : avgSentiment < -0.3 ? 'Retail Sector Under Pressure' : 'Consumer Trends Show Divergence',
            description: avgSentiment > 0.3
              ? 'Retail sales beating forecasts driven by strong employment and wage growth. E-commerce gaining market share.'
              : avgSentiment < -0.3
              ? 'Consumer pullback evident as inflation impacts discretionary spending. Retailers cutting guidance.'
              : 'Consumers shifting to value retailers while premium brands face headwinds. Online penetration accelerating.',
            impact,
            sector: 'Consumer',
            confidence: Math.min(70 + (analysisResults.retail.count * 4), 88)
          });
        }

        if (analysisResults.employment.count >= 2) {
          const avgSentiment = analysisResults.employment.sentiment / analysisResults.employment.count;
          const impact = avgSentiment > 0.3 ? 'bullish' : avgSentiment < -0.3 ? 'bearish' : 'neutral';
          generatedInsights.push({
            icon: TrendingUp,
            title: avgSentiment > 0.3 ? 'Labor Market Shows Strength' : avgSentiment < -0.3 ? 'Employment Concerns Rise' : 'Jobs Data Mixed',
            description: avgSentiment > 0.3
              ? 'Strong job gains and wage growth supporting consumer spending. Unemployment remains historically low.'
              : avgSentiment < -0.3
              ? 'Layoffs increasing as companies adjust to slowing growth. Unemployment claims trending higher.'
              : 'Labor market cooling gradually with hiring moderating but no sharp deterioration evident yet.',
            impact,
            sector: 'Employment',
            confidence: Math.min(80 + (analysisResults.employment.count * 3), 93)
          });
        }

        if (generatedInsights.length < 4) {
          const fallbackInsights: Insight[] = [
            {
              icon: TrendingUp,
              title: 'Market Volatility Continues',
              description: 'Indexes showing mixed performance as investors digest economic data and corporate earnings. Sector rotation active.',
              impact: 'neutral',
              sector: 'Market Overview',
              confidence: 65
            },
            {
              icon: DollarSign,
              title: 'Dollar Strength Impacts Trade',
              description: 'USD resilience affecting multinational earnings and commodity prices. Currency dynamics remain key market driver.',
              impact: 'mixed',
              sector: 'Currency',
              confidence: 70
            },
            {
              icon: Globe,
              title: 'Geopolitical Watch',
              description: 'International developments creating periodic volatility. Markets adapting to evolving global landscape.',
              impact: 'neutral',
              sector: 'Geopolitics',
              confidence: 60
            }
          ];

          while (generatedInsights.length < 4 && fallbackInsights.length > 0) {
            generatedInsights.push(fallbackInsights.shift()!);
          }
        }

        setInsights(generatedInsights.slice(0, 4));
        setLoading(false);
      } catch (error) {
        setInsights([
          {
            icon: Activity,
            title: 'Markets Digest Latest Data',
            description: 'Investors evaluating economic indicators and corporate developments. Volatility expected as trends develop.',
            impact: 'neutral',
            sector: 'Market Overview',
            confidence: 70
          },
          {
            icon: DollarSign,
            title: 'Fed Policy in Focus',
            description: 'Central bank decisions remain key driver. Markets sensitive to inflation data and rate path expectations.',
            impact: 'neutral',
            sector: 'Monetary Policy',
            confidence: 75
          },
          {
            icon: Building2,
            title: 'Tech Leadership Continues',
            description: 'Large-cap technology driving index performance. AI and cloud infrastructure themes attracting capital.',
            impact: 'bullish',
            sector: 'Technology',
            confidence: 80
          },
          {
            icon: Globe,
            title: 'Global Economic Balance',
            description: 'International markets showing varied performance. Regional divergence creating opportunities and risks.',
            impact: 'mixed',
            sector: 'Global Markets',
            confidence: 65
          }
        ]);
        setLoading(false);
      }
    };

    generateInsights();
    const interval = setInterval(generateInsights, 300000);
    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'bearish':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'neutral':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'mixed':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">What's Driving Markets Today</h3>
          <p className="text-slate-400">Key factors influencing market movements</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">What's Driving Markets Today</h3>
        <p className="text-slate-400">Key factors influencing market movements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/50 hover:border-teal-500/50 transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getImpactColor(insight.impact)} border`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                      {insight.title}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded border border-teal-500/30">
                      {insight.sector}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    {insight.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Confidence:</span>
                    <span className="text-xs text-teal-400 font-bold">{insight.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
