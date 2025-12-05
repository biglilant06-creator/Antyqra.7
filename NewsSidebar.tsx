import { useEffect, useState } from 'react';
import { ExternalLink, Clock, Radio } from 'lucide-react';
import { getMarketNews, MarketNews } from '../services/stockApi';

export default function NewsSidebar() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getMarketNews('general');
        setNews(newsData.slice(0, 10));
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-2/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-800 rounded"></div>
              <div className="h-3 bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
      <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-300" />
          <h3 className="text-lg font-black text-white">Live News Feed</h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-200 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Live
        </span>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        <div className="divide-y divide-slate-800/70">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-4 hover:bg-slate-800/70 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wide text-teal-300">{article.source}</span>
                    <span>
                      {new Date(article.datetime * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-teal-200">
                    {article.headline}
                  </h4>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-teal-300 flex-shrink-0 transition-colors mt-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
