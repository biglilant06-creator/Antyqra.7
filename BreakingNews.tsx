import { useEffect, useState } from 'react';
import { Loader2, Newspaper, ExternalLink } from 'lucide-react';
import { getMarketNews, MarketNews } from '../services/stockApi';

export default function BreakingNews() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const newsData = await getMarketNews('general');
        setNews(newsData.slice(0, 6));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Breaking News</h3>
          <p className="text-sm text-slate-600 mt-1">Latest market updates</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-rose-100 rounded-full">
          <Newspaper className="w-4 h-4 text-rose-600" />
          <span className="text-rose-600 text-xs font-bold">LIVE</span>
        </div>
      </div>

      <div className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-50 border border-slate-200 rounded-lg overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all"
            >
              {article.image && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </div>
              )}
              <div className="p-4">
                <h4 className="text-slate-900 font-semibold text-sm mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {article.headline}
                </h4>
                <p className="text-slate-600 text-xs mb-3 line-clamp-2">{article.summary}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-medium">{article.source}</span>
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
  );
}
